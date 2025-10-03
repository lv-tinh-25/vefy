import { ApiError, GoogleGenAI } from "@google/genai";

let genai: GoogleGenAI | null = null;

function getClient() {
  if (!genai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

// Each model has its own free-tier quota, so falling back keeps OCR working when the first runs out
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;

export type OcrOutcome =
  | { status: "ok"; km: number }
  | { status: "unreadable" }
  | { status: "unavailable" }
  | { status: "error" };

export function isQuotaError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429;
}

export async function generateWithFallback<T>(
  models: readonly string[],
  call: (model: string) => Promise<T>,
): Promise<T | null> {
  for (const model of models) {
    try {
      return await call(model);
    } catch (err) {
      if (!isQuotaError(err)) throw err;
      console.warn(`[OCR] ${model} quota exhausted, trying next model`);
    }
  }
  return null;
}

export function parseKm(text: string): number | null {
  if (!text || text === "ERROR") return null;
  // Take first number in case the model adds extra text
  const match = text.match(/\d[\d,.\s]*/);
  if (!match) return null;
  const km = parseInt(match[0].replace(/[.,\s]/g, ""), 10);
  if (isNaN(km) || km <= 0 || km > 10_000_000) return null;
  return km;
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

export async function readOdometer(imageBase64: string): Promise<OcrOutcome> {
  try {
    const client = getClient();
    const response = await generateWithFallback(MODELS, (model) =>
      client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, { text: PROMPT }],
          },
        ],
      }),
    );
    if (!response) return { status: "unavailable" };

    const km = parseKm(response.text?.trim() ?? "");
    return km === null ? { status: "unreadable" } : { status: "ok", km };
  } catch (err) {
    console.error("[OCR Error]", err);
    return { status: "error" };
  }
}
