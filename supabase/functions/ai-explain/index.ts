import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "explain") {
      systemPrompt = "You are an expert educator. Explain concepts clearly and concisely. Use examples when helpful. Keep explanations focused and under 200 words.";
      userPrompt = context 
        ? `Explain this text in simple terms:\n\n"${text}"\n\nContext from the video notes: ${context}`
        : `Explain this text in simple terms:\n\n"${text}"`;
    } else if (type === "summarize") {
      systemPrompt = "You are an expert at summarizing content. Create clear, bullet-point summaries that capture key points.";
      userPrompt = `Summarize the following notes into key bullet points:\n\n${text}`;
    } else if (type === "flashcards") {
      systemPrompt = "You are an expert educator who creates effective study flashcards. Generate flashcards in JSON format only.";
      userPrompt = `Based on these notes, generate 5-8 flashcards for studying. Return ONLY a JSON array with objects containing "question" and "answer" fields. No other text.\n\nNotes:\n${text}`;
    }

    console.log(`AI request - user: ${user.id}, type: ${type}, text length: ${text?.length || 0}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log(`AI response - user: ${user.id}, content length: ${content?.length || 0}`);

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
