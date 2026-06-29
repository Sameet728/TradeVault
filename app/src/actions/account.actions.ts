'use server';

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { TradingAccount, ITradingAccount } from '@/models/TradingAccount';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import type { TradingAccount as TradingAccountType } from '@/types/ai.types';

function toPlain(doc: ITradingAccount): TradingAccountType {
  const obj = doc.toObject();
  return {
    ...obj,
    _id: obj._id.toString(),
    userId: obj.userId.toString(),
    createdAt: obj.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: obj.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}

export async function getAccountsAction(): Promise<TradingAccountType[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();
  const docs = await TradingAccount.find({
    userId: userId,
    isActive: true,
  }).sort({ createdAt: -1 });

  return docs.map(toPlain);
}

export async function createAccountAction(
  data: Omit<TradingAccountType, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<{ error?: string; id?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    const account = await TradingAccount.create({
      ...data,
      userId,
    });

    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return { id: account._id.toString() };
  } catch (err: unknown) {
    console.error('[createAccountAction]', err);
    return { error: 'Failed to create account' };
  }
}

export async function updateAccountAction(
  id: string,
  data: Partial<TradingAccountType>
): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    await TradingAccount.findOneAndUpdate(
      { _id: id, userId },
      data
    );

    revalidatePath('/accounts');
    return {};
  } catch (err: unknown) {
    console.error('[updateAccountAction]', err);
    return { error: 'Failed to update account' };
  }
}

export async function deleteAccountAction(id: string): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    await TradingAccount.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false }
    );

    revalidatePath('/accounts');
    return {};
  } catch (err: unknown) {
    console.error('[deleteAccountAction]', err);
    return { error: 'Failed to delete account' };
  }
}
