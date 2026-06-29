import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Strategy } from '@/models/Strategy';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const strategies = await Strategy.find({ userId: user.id, archived: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ strategies });
  } catch (error) {
    console.error('[API Strategies GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const strategy = await Strategy.create({
      userId: user.id,
      name: body.name,
      description: body.description,
      parameters: body.parameters || [],
      checklist: body.checklist || [],
      isActive: true,
      archived: false,
      version: 1
    });

    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('[API Strategies POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
