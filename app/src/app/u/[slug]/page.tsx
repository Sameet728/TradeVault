import { connectDB } from '@/lib/db';
import { TradingAccount } from '@/models/TradingAccount';
import { Trade } from '@/models/Trade';
import { clerkClient } from '@clerk/nextjs/server';
import { PublicProfileClient } from '@/components/accounts/PublicProfileClient';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();

  const { slug } = await params;

  // Find the public account
  const account = await TradingAccount.findOne({ publicSlug: slug, isPublic: true }).lean();

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-zinc-400">This track record is private or does not exist.</p>
        </div>
      </div>
    );
  }

  // Fetch the user from Clerk
  let userEmail = 'Trader';
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(account.userId);
    if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
      userEmail = clerkUser.emailAddresses[0].emailAddress;
    }
  } catch (err) {
    console.error('Failed to fetch Clerk user:', err);
  }

  // Fetch trades for this account to calculate stats
  const trades = await Trade.find({ accountId: account._id, status: 'closed' }).sort({ tradeDate: 1 }).lean();

  // Calculate basic stats
  const totalTrades = trades.length;
  const wins = trades.filter(t => (t.pnl || 0) > 0);
  const losses = trades.filter(t => (t.pnl || 0) < 0);
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const netProfit = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);

  // Calculate equity curve
  let currentBalance = account.balance || 10000;
  const equityCurve = trades.map(t => {
    currentBalance += (t.pnl || 0);
    return {
      date: new Date(t.tradeDate).toLocaleDateString(),
      balance: currentBalance,
      equity: currentBalance,
      drawdown: 0
    };
  });

  return (
    <PublicProfileClient
      userEmail={userEmail}
      netProfit={netProfit}
      winRate={winRate}
      profitFactor={profitFactor}
      totalTrades={totalTrades}
      equityCurve={equityCurve}
    />
  );
}
