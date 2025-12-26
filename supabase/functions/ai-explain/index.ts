import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_TEXT_LENGTH = 10000;
const MAX_CONTEXT_LENGTH = 5000;
const VALID_TYPES = ['explain', 'summarize', 'flashcards'] as const;

type RequestType = typeof VALID_TYPES[number];

interface RequestBody {
  text: string;
  context?: string;
  type: RequestType;
}

function validateRequest(body: unknown): { valid: true; data: RequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const { text, context, type } = body as Record<string, unknown>;

  // Validate text
  if (typeof text !== 'string') {
    return { valid: false, error: 'Text field is required and must be a string' };
  }
  if (text.trim().length === 0) {
    return { valid: false, error: 'Text field cannot be empty' };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Text field must be less than ${MAX_TEXT_LENGTH} characters` };
  }

  // Validate context (optional)
  if (context !== undefined && context !== null) {
    if (typeof context !== 'string') {
      return { valid: false, error: 'Context field must be a string' };
    }
    if (context.length > MAX_CONTEXT_LENGTH) {
      return { valid: false, error: `Context field must be less than ${MAX_CONTEXT_LENGTH} characters` };
    }
  }

  // Validate type
  if (typeof type !== 'string') {
    return { valid: false, error: 'Type field is required and must be a string' };
  }
  if (!VALID_TYPES.includes(type as RequestType)) {
    return { valid: false, error: `Type must be one of: ${VALID_TYPES.join(', ')}` };
  }

  return {
    valid: true,
    data: {
      text: text.trim(),
      context: context ? String(context).trim() : undefined,
      type: type as RequestType,
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, context, type } = validation.data;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("Server configuration error: GEMINI_API_KEY missing");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use the flash model for speed and efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "explain") {
      systemPrompt = "You are an expert educator. Explain concepts clearly and concisely. Use examples when helpful. Keep explanations focused and under 200 words.";
      userPrompt = context
        ? `${systemPrompt}\n\nExplain this text in simple terms:\n\n"${text}"\n\nContext from the video notes: ${context}`
        : `${systemPrompt}\n\nExplain this text in simple terms:\n\n"${text}"`;
    } else if (type === "summarize") {
      systemPrompt = "You are an expert at summarizing content. Create clear, bullet-point summaries that capture key points.";
      userPrompt = `${systemPrompt}\n\nSummarize the following notes into key bullet points:\n\n${text}`;
    } else if (type === "flashcards") {
      systemPrompt = "You are an expert educator who creates effective study flashcards. Generate flashcards in JSON format only.";
      userPrompt = `${systemPrompt}\n\nBased on these notes, generate 5-8 flashcards for studying. Return ONLY a JSON array with objects containing "question" and "answer" fields. No other text (no markdown code blocks, just raw JSON).\n\nNotes:\n${text}`;
    }

    console.log(`AI request - user: ${user.id}, type: ${type}, text length: ${text?.length || 0}`);

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    let content = response.text();

    console.log(`AI response - user: ${user.id}, content length: ${content?.length || 0}`);

    // Cleanup JSON response for flashcards if it keeps markdown formatting
    if (type === "flashcards") {
      content = content.replace(/```json\n|\n```/g, "").trim();
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-explain function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
