import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is available
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let model = null;

if (API_KEY) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Using gemini-1.5-pro for best multimodal performance
    model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
}

export async function analyzeImage(imageBase64) {
    if (!model) {
        throw new Error("Gemini API Key is missing. Please add it to your environment variables.");
    }

    const prompt = `
    You are an expert math tutor. Analyze this image. 
    1. Extract the math problem text.
    2. Identify the core knowledge points required to solve it.
    3. Generate 3 diagnostic questions (multiple choice or short answer) to test these knowledge points.
    
    Return the response in this JSON format:
    {
      "problemText": "...",
      "knowledgePoints": ["Point 1", "Point 2"],
      "questions": [
        {
          "id": 1,
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "...",
          "explanation": "..."
        }
      ]
    }
  `;

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg", // Adjust based on actual input
        },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Basic cleanup to ensure JSON parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse Gemini response");
}
