const fs = require('fs');

function addDummyCheck(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('next/headers')) {
    content = content.replace(/import \{ auth \} from '@clerk\/nextjs\/server';/, "import { auth } from '@clerk/nextjs/server';\nimport { cookies } from 'next/headers';");
  }
  
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  fs.writeFileSync(file, content, 'utf8');
}

// 1. trade.actions.ts
addDummyCheck('src/actions/trade.actions.ts', [
  {
    search: /export async function getDashboardStatsAction\(\): Promise<DashboardStats> \{([\s\S]*?)await connectDB\(\);/,
    replace: "import { dummyDashboardStats, dummyTrades } from '@/lib/dummyData';\nexport async function getDashboardStatsAction(): Promise<DashboardStats> {$1if (cookies().get('dummy-mode')?.value === 'true') return dummyDashboardStats;\n  await connectDB();"
  },
  {
    search: /export async function getTradesAction\(filters\?: TradeFilters\): Promise<TradeType\[\]> \{([\s\S]*?)await connectDB\(\);/,
    replace: "export async function getTradesAction(filters?: TradeFilters): Promise<TradeType[]> {$1if (cookies().get('dummy-mode')?.value === 'true') return dummyTrades as any;\n  await connectDB();"
  }
]);

// 2. strategy.actions.ts
addDummyCheck('src/actions/strategy.actions.ts', [
  {
    search: /export async function getStrategiesAction\(\): Promise<StrategyType\[\]> \{([\s\S]*?)await connectDB\(\);/,
    replace: "import { dummyStrategies } from '@/lib/dummyData';\nexport async function getStrategiesAction(): Promise<StrategyType[]> {$1if (cookies().get('dummy-mode')?.value === 'true') return dummyStrategies as any;\n  await connectDB();"
  }
]);

// 3. analytics.actions.ts
addDummyCheck('src/actions/analytics.actions.ts', [
  {
    search: /export async function getEquityCurveAction\(filters\?: AnalyticsFilters\): Promise<EquityPoint\[\]> \{([\s\S]*?)await connectDB\(\);/,
    replace: `export async function getEquityCurveAction(filters?: AnalyticsFilters): Promise<EquityPoint[]> {$1if (cookies().get('dummy-mode')?.value === 'true') {
    let balance = 0; let peak = 0;
    return Array.from({length: 30}).map((_, i) => {
      balance += Math.random() * 200 - 80;
      if(balance>peak) peak = balance;
      const d = new Date(); d.setDate(d.getDate() - (30 - i));
      return { date: d.toISOString().split('T')[0], balance: parseFloat(balance.toFixed(2)), equity: parseFloat(balance.toFixed(2)), drawdown: peak > 0 ? parseFloat((((peak - balance) / peak) * 100).toFixed(2)) : 0 };
    });
  }\n  await connectDB();`
  }
]);

console.log('Dummy intercepts added!');
