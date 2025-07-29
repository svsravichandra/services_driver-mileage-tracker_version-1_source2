
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts the odometer reading from a base64 encoded image.
 * @param base64Image The base64 encoded string of the odometer image.
 * @returns A promise that resolves to the numerical odometer reading.
 */
export const extractOdometerReading = async (base64Image: string): Promise<number> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `You are an expert at reading odometers from images. 
           Extract only the numerical mileage value from the following image of a car's odometer. 
           Do not include any other text, units (like km or mi), commas, or explanations. 
           If the reading has a decimal, include it.
           The output must be a single number. For example: 123456 or 12345.6`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const text = response.text.trim();
    
    if (!text || isNaN(parseFloat(text))) {
      throw new Error(`Could not read a valid number from the image. Gemini responded: ${text}`);
    }

    return parseFloat(text);

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a response from the AI. Please check the image and try again.");
  }
};
