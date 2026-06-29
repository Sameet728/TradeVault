import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Playbook } from '@/models/Playbook';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const playbooks = await Playbook.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ playbooks });
  } catch (error) {
    console.error('[API Playbooks GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const playbook = await Playbook.create({
      userId: user.id,
      name: body.name,
      description: body.description,
      criteria: body.criteria || [],
      imageUrls: body.imageUrls || [],
    });

    return NextResponse.json({ success: true, playbook });
  } catch (error) {
    console.error('[API Playbooks POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
