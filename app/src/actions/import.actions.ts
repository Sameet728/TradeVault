'use server';

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

interface ImportedTrade {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  pnl?: number;
  tradeDate: string;
  closeDate?: string;
  status: 'open' | 'closed';
}

interface ImportResult {
  imported: number;
  skipped: number;
  error?: string;
}

export async function importTradesAction(
  accountId: string,
  trades: ImportedTrade[]
): Promise<ImportResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { imported: 0, skipped: 0, error: 'Unauthorized' };

    await connectDB();

    const accId = new Types.ObjectId(accountId);

    let imported = 0;
    let skipped = 0;

    for (const trade of trades) {
      try {
        await Trade.create({
          userId,
          accountId: accId,
          symbol: trade.symbol.toUpperCase(),
          direction: trade.direction,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          lotSize: trade.lotSize || 1,
          pnl: trade.pnl,
          tradeDate: new Date(trade.tradeDate),
          closeDate: trade.closeDate ? new Date(trade.closeDate) : undefined,
          status: trade.status,
          importedFrom: 'MT5',
          parameterValues: new Map(),
          checklistValues: new Map(),
          notes: {},
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/trades');
    revalidatePath('/analytics');

    return { imported, skipped };
  } catch (err: unknown) {
    console.error('[importTradesAction]', err);
    return { imported: 0, skipped: 0, error: 'Import failed' };
  }
}
