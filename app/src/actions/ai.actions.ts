'use server';

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { AIReview, AIWeeklyReport } from '@/models/AIReview';
import { Strategy } from '@/models/Strategy';
import { generateJSON, generateText } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import type {
  AIReview as AIReviewType,
  AIWeeklyReport as AIWeeklyReportType,
  AIPatternDiscovery,
  AIPatternInsight,
} from '@/types/ai.types';

interface GeminiReviewResponse {
  strengths: string[];
  weaknesses: string[];
  mistakes: string[];
  improvements: string[];
  score: number;
  summary: string;
}

export async function generateTradeReviewAction(
  tradeId: string
): Promise<{ error?: string; review?: AIReviewType }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();

    const trade = await Trade.findOne({
      _id: tradeId,
      userId,
    }).populate('strategyId', 'name parameters');

    if (!trade) return { error: 'Trade not found' };

    const paramValues = Object.fromEntries(trade.parameterValues ?? new Map());
    const strategy = trade.strategyId as { name?: string } | null;

    const prompt = `You are an expert trading coach analyzing a trade. Respond ONLY with valid JSON.

Trade Details:
- Symbol: ${trade.symbol}
- Direction: ${trade.direction}
- Entry: ${trade.entryPrice}
- Exit: ${trade.exitPrice ?? 'Open'}
- Stop Loss: ${trade.stopLoss ?? 'Not set'}
- Take Profit: ${trade.takeProfit ?? 'Not set'}
- PnL: ${trade.pnl ?? 'N/A'}
- Risk:Reward: ${trade.rr ?? 'N/A'}
- Strategy: ${strategy?.name ?? 'None'}
- Session: ${trade.session ?? 'N/A'}
- Strategy Parameters: ${JSON.stringify(paramValues)}
- Notes: ${JSON.stringify(trade.notes)}
- Result: ${(trade.pnl ?? 0) > 0 ? 'WIN' : (trade.pnl ?? 0) < 0 ? 'LOSS' : 'BREAKEVEN'}

Analyze this trade and respond with JSON in exactly this format:
{
  "strengths": ["string array of 2-4 strengths"],
  "weaknesses": ["string array of 2-4 weaknesses"],
  "mistakes": ["string array of key mistakes (empty if none)"],
  "improvements": ["string array of 2-4 actionable improvements"],
  "score": <integer 0-100 representing trade quality>,
  "summary": "One paragraph summary of the trade"
}`;

    const response = await generateJSON<GeminiReviewResponse>(prompt);

    // Upsert review
    const existing = await AIReview.findOne({ tradeId, userId });

    const reviewDoc = existing
      ? await AIReview.findOneAndUpdate({ tradeId, userId }, { ...response }, { new: true })
      : await AIReview.create({ userId, tradeId, ...response });

    revalidatePath(`/trades/${tradeId}`);
    revalidatePath('/ai/review');

    return {
      review: {
        ...reviewDoc!.toObject(),
        _id: reviewDoc!._id.toString(),
        userId: reviewDoc!.userId.toString(),
        tradeId: tradeId,
        generatedAt: reviewDoc!.generatedAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    console.error('[generateTradeReviewAction]', err);
    return { error: 'Failed to generate AI review. Check your Gemini API key.' };
  }
}

export async function generateWeeklyReportAction(): Promise<{ error?: string; report?: AIWeeklyReportType }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const trades = await Trade.find({
      userId,
      tradeDate: { $gte: weekStart, $lte: weekEnd },
      status: 'closed',
    }).populate('strategyId', 'name').lean();

    if (trades.length === 0) {
      return { error: 'No closed trades found for this week.' };
    }

    const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
    const winRate = (wins.length / trades.length) * 100;
    const netPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);

    const strategyPerf: Record<string, { wins: number; total: number; name: string }> = {};
    for (const t of trades) {
      const sid = t.strategyId?.toString() ?? 'none';
      const sname = (t.strategyId as { name?: string } | null)?.name ?? 'No Strategy';
      if (!strategyPerf[sid]) strategyPerf[sid] = { wins: 0, total: 0, name: sname };
      strategyPerf[sid].total++;
      if ((t.pnl ?? 0) > 0) strategyPerf[sid].wins++;
    }

    const mistakes = trades.flatMap((t) => t.notes?.mistakes ? [t.notes.mistakes] : []);

    const prompt = `You are an expert trading coach writing a weekly performance report. Respond ONLY with valid JSON.

Week: ${weekStart.toDateString()} to ${weekEnd.toDateString()}
Total Trades: ${trades.length}
Win Rate: ${winRate.toFixed(1)}%
Net PnL: $${netPnl.toFixed(2)}
Strategy Performance: ${JSON.stringify(strategyPerf)}
Trader Mistakes Logged: ${mistakes.join(' | ')}

Respond in this exact JSON format:
{
  "bestStrategy": "strategy name or 'N/A'",
  "worstStrategy": "strategy name or 'N/A'",
  "commonMistakes": ["top 3 recurring mistakes as strings"],
  "suggestedImprovements": ["3-5 actionable improvements"],
  "summary": "2-3 paragraph weekly summary with specific actionable advice"
}`;

    const response = await generateJSON<{
      bestStrategy: string;
      worstStrategy: string;
      commonMistakes: string[];
      suggestedImprovements: string[];
      summary: string;
    }>(prompt);

    const reportData = {
      userId,
      weekStart,
      weekEnd,
      tradeCount: trades.length,
      winRate,
      netPnl,
      ...response,
      generatedAt: new Date(),
    };

    const report = await AIWeeklyReport.findOneAndUpdate(
      { userId, weekStart },
      reportData,
      { upsert: true, new: true }
    );

    revalidatePath('/ai/weekly');

    return {
      report: {
        ...report.toObject(),
        _id: report._id.toString(),
        userId: report.userId.toString(),
        weekStart: report.weekStart.toISOString(),
        weekEnd: report.weekEnd.toISOString(),
        generatedAt: report.generatedAt.toISOString(),
        bestStrategy: report.bestStrategy || 'N/A',
        worstStrategy: report.worstStrategy || 'N/A',
      },
    };
  } catch (err: unknown) {
    console.error('[generateWeeklyReportAction]', err);
    return { error: 'Failed to generate weekly report.' };
  }
}

export async function generatePatternDiscoveryAction(): Promise<{ error?: string; discovery?: AIPatternDiscovery }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();

    const trades = await Trade.find({
      userId,
      status: 'closed',
    })
      .limit(500)
      .sort({ tradeDate: -1 })
      .lean();

    if (trades.length < 20) {
      return { error: 'You need at least 20 closed trades for pattern discovery.' };
    }

    // Aggregate stats for AI
    const sessionStats: Record<string, { wins: number; total: number; pnl: number }> = {};
    const symbolStats: Record<string, { wins: number; total: number; pnl: number }> = {};
    const paramStats: Record<string, Record<string, { wins: number; total: number }>> = {};

    for (const t of trades) {
      const won = (t.pnl ?? 0) > 0;
      if (t.session) {
        sessionStats[t.session] = sessionStats[t.session] ?? { wins: 0, total: 0, pnl: 0 };
        sessionStats[t.session].total++;
        sessionStats[t.session].pnl += t.pnl ?? 0;
        if (won) sessionStats[t.session].wins++;
      }
      symbolStats[t.symbol] = symbolStats[t.symbol] ?? { wins: 0, total: 0, pnl: 0 };
      symbolStats[t.symbol].total++;
      symbolStats[t.symbol].pnl += t.pnl ?? 0;
      if (won) symbolStats[t.symbol].wins++;

      const params = t.parameterValues instanceof Map
        ? Object.fromEntries(t.parameterValues)
        : (t.parameterValues ?? {});
      for (const [key, val] of Object.entries(params as Record<string, unknown>)) {
        const valStr = String(val);
        paramStats[key] = paramStats[key] ?? {};
        paramStats[key][valStr] = paramStats[key][valStr] ?? { wins: 0, total: 0 };
        paramStats[key][valStr].total++;
        if (won) paramStats[key][valStr].wins++;
      }
    }

    const prompt = `You are a quantitative trading analyst. Analyze these trading statistics and identify actionable patterns. Respond ONLY with valid JSON.

Total Trades Analyzed: ${trades.length}
Session Stats: ${JSON.stringify(sessionStats)}
Symbol Stats: ${JSON.stringify(symbolStats)}
Strategy Parameter Stats: ${JSON.stringify(paramStats)}

Respond with a JSON array of insights:
[
  {
    "category": "Best Session" | "Worst Session" | "Best Symbol" | "Worst Symbol" | "Optimal Parameter" | "Avoid Parameter" | "Edge Pattern" | "Risk Warning",
    "insight": "specific, data-backed insight",
    "confidence": "low" | "medium" | "high",
    "supportingData": "the numbers that support this",
    "actionable": "what the trader should specifically do"
  }
]
Generate 6-10 insights.`;

    const insights = await generateJSON<AIPatternInsight[]>(prompt);

    const discovery: AIPatternDiscovery = {
      _id: new Types.ObjectId().toString(),
      userId,
      insights,
      tradesSampled: trades.length,
      generatedAt: new Date().toISOString(),
    };

    revalidatePath('/ai/patterns');

    return { discovery };
  } catch (err: unknown) {
    console.error('[generatePatternDiscoveryAction]', err);
    return { error: 'Failed to generate pattern discovery.' };
  }
}
