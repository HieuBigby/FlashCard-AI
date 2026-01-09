
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseRawTextToFlashcards = async (text: string): Promise<Flashcard[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse the following text and extract flashcards. Each flashcard should have a 'term' and a 'definition'. If there is extra context or examples, include them in the 'context' field. 

Input Text:
${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
            context: { type: Type.STRING, description: "Optional context or example sentence" }
          },
          required: ["term", "definition"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || '[]');
  return parsed.map((item: any, index: number) => ({
    ...item,
    id: `${Date.now()}-${index}`
  }));
};
