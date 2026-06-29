import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to .env.local');
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

const MODEL_NAME = 'gemini-2.5-flash';

export async function generateText(prompt: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result: GenerateContentResult = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: 'application/json' },
  });
  const result: GenerateContentResult = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}
