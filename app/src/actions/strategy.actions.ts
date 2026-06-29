'use server';

import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Strategy, IStrategy } from '@/models/Strategy';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import type { Strategy as StrategyType, StrategyFormData } from '@/types/strategy.types';

function toPlain(doc: IStrategy): StrategyType {
  const obj = doc.toObject();
  return {
    ...obj,
    _id: obj._id.toString(),
    userId: obj.userId.toString(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
}

import { dummyStrategies } from '@/lib/dummyData';
export async function getStrategiesAction(): Promise<StrategyType[]> {
  const { userId } = await auth();
  if (!userId) return [];

  if ((await cookies()).get('dummy-mode')?.value === 'true') return dummyStrategies as any;
  await connectDB();
  const docs = await Strategy.find({
    userId: userId,
  }).sort({ createdAt: -1 });

  return docs.map(toPlain);
}

export async function getStrategyAction(id: string): Promise<StrategyType | null> {
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();
  const doc = await Strategy.findOne({ _id: id, userId: userId });
  return doc ? toPlain(doc) : null;
}

export async function createStrategyAction(
  data: StrategyFormData
): Promise<{ error?: string; id?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    const strategy = await Strategy.create({
      ...data,
      userId: userId,
    });

    revalidatePath('/strategies');
    revalidatePath('/trades/new');

    return { id: strategy._id.toString() };
  } catch (err: unknown) {
    console.error('[createStrategyAction]', err);
    const msg = err instanceof Error && err.message.includes('duplicate')
      ? 'A strategy with this name already exists.'
      : 'Failed to create strategy';
    return { error: msg };
  }
}

export async function updateStrategyAction(
  id: string,
  data: Partial<StrategyFormData>
): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    await Strategy.findOneAndUpdate(
      { _id: id, userId: userId },
      data
    );

    revalidatePath('/strategies');
    revalidatePath(`/strategies/${id}`);

    return {};
  } catch (err: unknown) {
    console.error('[updateStrategyAction]', err);
    return { error: 'Failed to update strategy' };
  }
}

export async function deleteStrategyAction(id: string): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    await Strategy.findOneAndDelete({ _id: id, userId: userId });

    revalidatePath('/strategies');
    return {};
  } catch (err: unknown) {
    console.error('[deleteStrategyAction]', err);
    return { error: 'Failed to delete strategy' };
  }
}
