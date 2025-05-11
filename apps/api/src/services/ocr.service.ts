import { GoogleGenAI } from "@google/genai";

let genai: GoogleGenAI | null = null;

function getClient() {
  if (!genai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

export interface OcrResult {
  km: number | null;
  success: boolean;
  message: string;
}

const PROMPT = `You are analyzing a photo of a vehicle dashboard (car or motorcycle).

Your ONLY task: find and read the ODOMETER — the TOTAL distance the vehicle has traveled in its lifetime.

IMPORTANT distinctions:
- ODOMETER: usually a small window showing 5-7 digits (e.g., "001264", "45230", "123456"). This is what we want.
- SPEEDOMETER: the big number showing CURRENT speed (e.g., "0" when stopped, "60" when moving). IGNORE this.
- TRIP METER: similar to odometer but shorter, labeled "TRIP" or "A"/"B". IGNORE this.
- RPM/TACHOMETER: engine speed, usually x1000. IGNORE this.
- GEAR indicator (1,2,3,N,D). IGNORE this.
- Fuel gauge, temperature. IGNORE these.

Instructions:
1. Carefully identify the odometer reading (total lifetime distance)
2. Read all digits, including any decimal point (e.g., "126.4")
3. If decimal present, return WITHOUT decimal (e.g., "126.4" → "126")
4. Return ONLY the integer number, no units, no text, no explanation
5. If you cannot clearly identify the odometer or the image is unclear, return exactly: ERROR

Examples of valid responses:
45230
1268
126
ERROR`;

export async function readOdometer(imageBase64: string): Promise<OcrResult> {
  try {
    const client = getClient();

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
            { text: PROMPT },
          ],
        },
      ],
    });

    const text = response.text?.trim() ?? "";

    if (text === "ERROR" || !text) {
      return {
        km: null,
        success: false,
        message: "Cannot read odometer from image",
      };
    }

    // Take first integer from response (in case AI adds extra text)
    const match = text.match(/\d[\d,.\s]*/);
    if (!match) {
      return {
        km: null,
        success: false,
        message: "Cannot read odometer from image",
      };
    }

    const km = parseInt(match[0].replace(/[.,\s]/g, ""), 10);

    if (isNaN(km) || km <= 0 || km > 10_000_000) {
      return {
        km: null,
        success: false,
        message: "Cannot read odometer from image",
      };
    }

    return { km, success: true, message: `Read: ${km.toLocaleString()} km` };
  } catch (err) {
    console.error("[OCR Error]", err);
    return { km: null, success: false, message: "OCR processing error" };
  }
}
