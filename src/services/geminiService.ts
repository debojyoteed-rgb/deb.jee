import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function solveDoubt(question: string, subject: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an expert JEE Mains tutor. A student has a doubt in ${subject}. 
      Question: ${question}
      
      Provide a clear, step-by-step explanation. Use LaTeX for mathematical formulas if needed. 
      Keep the tone encouraging and professional.`,
    });
    return response.text || "I couldn't generate an answer. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while solving your doubt. Please try again.";
  }
}

export async function generateChapterNote(topicTitle: string, subjectName: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an expert JEE Mains educator. Create a comprehensive, high-quality "Quick Revision Note" for the chapter: "${topicTitle}" in ${subjectName}.
      
      The note must include:
      1. **Core Concepts**: Key theoretical points.
      2. **Important Formulas**: All essential mathematical/chemical formulas.
      3. **Key Tips & Tricks**: Common pitfalls and shortcuts for JEE Mains.
      4. **Summary**: A brief wrap-up.
      
      Use Markdown formatting for headings, bullet points, and LaTeX for formulas. 
      The content should be at the level of top coaching institutes like Allen or FIITJEE.`,
    });
    return response.text || "Failed to generate notes. Please try again.";
  } catch (error) {
    console.error("Gemini Error (Notes):", error);
    return "Error generating notes. Please check your connection.";
  }
}
