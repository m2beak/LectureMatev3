import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateAIContent = async (prompt: string): Promise<string> => {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

export const generateJSONContent = async (prompt: string): Promise<string> => {
    const jsonPrompt = `${prompt}\n\nReturn the response in raw JSON format only. Do not wrap it in markdown code blocks (like \`\`\`json). Just the raw JSON string.`;
    const content = await generateAIContent(jsonPrompt);
    // Cleanup if model still adds markdown
    return content.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
};
