
import { GoogleGenAI, Type } from "@google/genai";
import { Item } from "../types";

export const matchItems = async (targetItem: Item, candidates: Item[]): Promise<{ itemId: string; score: number; reason: string }[]> => {
  if (candidates.length === 0) return [];

  // Note: For demo/frontend matching we still need an API Key. 
  // In production, this should ideally stay in the backend.
  const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY || '' });
  
  const prompt = `
    Compare the following "${targetItem.type}" item with a list of items that were ${targetItem.type === 'lost' ? 'found' : 'lost'}.
    Target Item:
    Title: ${targetItem.title}
    Category: ${targetItem.category}
    Description: ${targetItem.description}
    Location: ${targetItem.location}

    Candidate Items:
    ${candidates.map((item, idx) => `${idx + 1}. [ID: ${item.id}] ${item.title} - ${item.category} - ${item.description} - ${item.location}`).join('\n')}

    Rank the top 3 potential matches based on keyword similarity, visual description, and location.
    Return only valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              score: { type: Type.NUMBER, description: "Match percentage 0-100" },
              reason: { type: Type.STRING }
            },
            required: ["itemId", "score", "reason"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini matching error:", error);
    return [];
  }
};
