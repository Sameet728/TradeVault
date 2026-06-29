import { connectDB } from '@/lib/db';
import { TradingAccount } from '@/models/TradingAccount';
import { Trade } from '@/models/Trade';
import { User } from '@/models/User';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingUp, Target, Activity, DollarSign, BarChart2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  await connectDB();

  // Find the public account
  const account = await TradingAccount.findOne({ publicSlug: params.slug, isPublic: true }).lean();

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

  // Fetch the user
  const user = await User.findById(account.userId).lean();

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
      balance: currentBalance
    };
  });

  return (
    <div className="public-profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar">{user?.email?.charAt(0).toUpperCase() || 'T'}</div>
          <div>
            <h1>{user?.email?.split('@')[0] || 'Trader'}'s Verified Track Record</h1>
            <span className="badge">TradeVault Verified</span>
          </div>
        </div>
      </div>

      <div className="stats-grid mt-6">
        <StatCard id="stat-pnl" label="Net Profit" value={netProfit} format="currency" icon={<DollarSign size={14} />} />
        <StatCard id="stat-winrate" label="Win Rate" value={winRate} format="percent" icon={<Target size={14} />} />
        <StatCard id="stat-pf" label="Profit Factor" value={profitFactor.toFixed(2)} format="raw" icon={<BarChart2 size={14} />} />
        <StatCard id="stat-trades" label="Total Trades" value={totalTrades} format="number" icon={<Activity size={14} />} />
      </div>

      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h3>Verified Equity Curve</h3>
          </div>
          <div className="card-body">
            {equityCurve.length > 0 ? (
              <DashboardCharts equityCurve={equityCurve} monthlyReturns={[]} />
            ) : (
              <div className="p-8 text-center text-zinc-500">Not enough data to generate equity curve.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .public-profile-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          color: var(--color-foreground);
          font-family: var(--font-sans);
        }
        .profile-header {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 24px; border-bottom: 1px solid var(--color-border);
        }
        .profile-info { display: flex; align-items: center; gap: 16px; }
        .avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--color-accent); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; font-weight: 700;
        }
        .profile-info h1 { margin: 0 0 6px 0; font-size: 1.5rem; letter-spacing: -0.02em; }
        .badge {
          background: rgba(34, 197, 94, 0.15); color: #22C55E;
          padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .mt-6 { margin-top: 24px; }
        .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
        .card-header { padding: 16px 20px; border-bottom: 1px solid var(--color-border-subtle); }
        .card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
        .card-body { padding: 20px; }
      `}</style>
    </div>
  );
}
