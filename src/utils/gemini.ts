
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("VITE_GEMINI_API_KEY is missing!");
        throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Switching to gemini-pro as requested due to 404 with flash
    return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const generateAIContent = async (prompt: string): Promise<string> => {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Specific fallback for 404 or model not found
        if (error.message?.includes("404") || error.toString().includes("404")) {
            console.error("Check if Generative Language API is enabled in Google Cloud Console");
        }

        throw error;
    }
};

export const generateJSONContent = async (prompt: string): Promise<string> => {
    const jsonPrompt = `${prompt}\n\nReturn the response in raw JSON format only. Do not wrap it in markdown code blocks (like \`\`\`json). Just the raw JSON string.`;
    const content = await generateAIContent(jsonPrompt);
    // Cleanup if model still adds markdown
    return content.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
};
