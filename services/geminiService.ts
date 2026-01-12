
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProductAdvice(productName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide common shelf life (in days) and best storage practice for: ${productName}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedShelfLife: { type: Type.NUMBER, description: "Estimated shelf life in days" },
            storageAdvice: { type: Type.STRING },
            category: { type: Type.STRING, description: "Suggested category: Food, Medicine, Cosmetics, Household, or Other" }
          },
          required: ["estimatedShelfLife", "storageAdvice", "category"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function extractProductInfoFromImage(base64Data: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Analyze this product image. 1. Find the product name. 2. Look for any expiration date (often labeled EXP, Use By, Best Before). 3. Format the date strictly as YYYY-MM-DD. If only MM/YY is found, use the last day of that month. 4. Categorize as Food, Medicine, Cosmetics, Household, or Other." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            expiryDate: { type: Type.STRING, description: "YYYY-MM-DD format only, or null if not found" },
            category: { type: Type.STRING }
          },
          required: ["name", "category"]
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Vision API Error:", error);
    return null;
  }
}

export async function generateNotificationEmail(productName: string, daysLeft: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, professional, and slightly urgent notification email body for a product named "${productName}" that is expiring in ${daysLeft} days. The brand is "Vigilant". Include a call to action to check the inventory. Keep it under 60 words.`,
    });
    return response.text || `URGENT: Your ${productName} is expiring in ${daysLeft} days.`;
  } catch (error) {
    return `VIGILANT ALERT: ${productName} expires in ${daysLeft} days.`;
  }
}

export async function getRecipeSuggestion(items: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I have these items expiring soon: ${items.join(", ")}. Suggest a simple recipe to use them.`,
    });
    return response.text || "Could not fetch suggestions at this time.";
  } catch (error) {
    return "Could not fetch suggestions at this time.";
  }
}
