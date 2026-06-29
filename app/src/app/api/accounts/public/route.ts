import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TradingAccount } from '@/models/TradingAccount';
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { accountId, isPublic } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    await connectDB();

    const account = await TradingAccount.findOne({ _id: accountId, userId: user.id });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    account.isPublic = isPublic;

    // Generate a unique slug if making public and one doesn't exist
    if (isPublic && !account.publicSlug) {
      // 8-character random hex
      account.publicSlug = crypto.randomBytes(4).toString('hex');
    }

    await account.save();

    return NextResponse.json({ 
      success: true, 
      isPublic: account.isPublic, 
      publicSlug: account.publicSlug 
    });

  } catch (error) {
    console.error('[API Account Public]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
