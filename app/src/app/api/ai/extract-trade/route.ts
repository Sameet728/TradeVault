import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if keys are present
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { imageBase64, skipExtraction } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    let imageUrl = null;
    
    // Optional: Upload to Cloudinary first
    try {
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        const uploadRes = await cloudinary.uploader.upload(imageBase64, { folder: 'tradevault_screenshots' });
        imageUrl = uploadRes.secure_url;
      }
    } catch (e) {
      console.error('Cloudinary upload failed:', e);
    }

    if (skipExtraction) {
      return NextResponse.json({ data: null, imageUrl });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The imageBase64 usually comes with "data:image/png;base64,...", so we need to extract the raw base64 and mime type.
    const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    const mimeType = match[1];
    const data = match[2];

    const prompt = `Analyze this trading screenshot (likely from TradingView, MetaTrader 5, or a Prop Firm like BlueGuardian Order Book).
Extract the following information about the trade if visible:
1. symbol: The trading symbol (e.g., XAUUSD, EURUSD, BTCUSDT, US30, SPX500, NQ100). Return just the raw letters.
2. direction: Either "LONG" or "SHORT"
3. entryPrice: The exact entry price as a number
4. stopLoss: The exact stop loss price as a number (if visible)
5. takeProfit: The exact take profit price as a number (if visible)
6. rr: The Risk to Reward ratio as a number (e.g. 2.5, 3.1)
7. session: The trading session this likely occurred in. Options: "London", "New York", "Asian", "Sydney", "London/NY Overlap", "Other". Estimate based on timezone/time if visible, otherwise return null.

Return ONLY a valid JSON object matching this exact format, with no markdown formatting or extra text:
{
  "symbol": string | null,
  "direction": "LONG" | "SHORT" | null,
  "entryPrice": number | null,
  "stopLoss": number | null,
  "takeProfit": number | null,
  "rr": number | null,
  "session": string | null
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    return NextResponse.json({ data: parsed, imageUrl });

  } catch (error: any) {
    console.error('AI Extraction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
