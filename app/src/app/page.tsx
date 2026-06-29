'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import {
  ArrowRight, BarChart3, Zap, BrainCircuit, Calendar,
  Target, Upload, FileText, TrendingUp, Search, Image,
  ChevronDown, Check, ArrowUpRight, LayoutDashboard,
  Activity, Database, Cpu, Monitor, Shield, Clock, 
  Users, BarChart2, TrendingDown, RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const FEATURES = [
  { icon: <BrainCircuit size={16} />, title: 'AI Trade Review', desc: 'Weekly AI-powered analysis of your trades, identifying patterns and improvement areas.' },
  { icon: <Zap size={16} />, title: 'Strategy Builder', desc: 'Create named strategies with dynamic parameters, checklists and tag all your trades.' },
  { icon: <BarChart3 size={16} />, title: 'Dynamic Parameters', desc: 'Track custom confluence factors, session types, and setup categories per strategy.' },
  { icon: <RefreshCw size={16} />, title: 'MT5 Auto-Sync', desc: 'Expert Advisor syncs every closed trade to your journal in real time, hands-free.' },
  { icon: <Target size={16} />, title: 'Prop Firm Tracker', desc: 'Monitor drawdown limits, daily loss, target progress and account phase for any firm.' },
  { icon: <Activity size={16} />, title: 'Advanced Analytics', desc: 'Equity curve, monthly PnL, win rate by session, profit factor, expectancy and more.' },
  { icon: <Upload size={16} />, title: 'CSV Import', desc: 'Import trade history from any broker with our intelligent CSV mapping engine.' },
  { icon: <Image size={16} />, title: 'Trade Screenshots', desc: 'Attach chart screenshots to every trade, stored securely on Cloudinary.' },
  { icon: <FileText size={16} />, title: 'Weekly Reports', desc: 'Email reports with AI insights delivered every Sunday to your inbox automatically.' },
  { icon: <Search size={16} />, title: 'Pattern Discovery', desc: 'The AI scans your journal to surface hidden patterns across sessions and setups.' },
  { icon: <Calendar size={16} />, title: 'Calendar View', desc: 'Interactive heatmap calendar — click any day to drill into that session\'s trades.' },
  { icon: <FileText size={16} />, title: 'PDF Reports', desc: 'Generate printable performance reports for prop firm reviews or personal records.' },
];

const FAQ = [
  { q: 'How does MT5 auto-sync work?', a: 'You install our custom Expert Advisor in MetaTrader 5. Every time you close a trade, it sends the trade data to your TradeVault account via a secure API endpoint. No manual entry required.' },
  { q: 'Can I import old trade history?', a: 'Yes. Use our CSV import tool that supports MT4/MT5 export format, as well as custom column mapping for any broker export.' },
  { q: 'Does it support multiple accounts?', a: 'Absolutely. You can add unlimited trading accounts — personal, prop firm, demo — and switch between them anywhere in the dashboard.' },
  { q: 'What AI model powers the trade reviews?', a: 'We use Google Gemini with a custom system prompt built specifically for trading analysis. Reviews are generated from your actual trade data.' },
  { q: 'Is my trading data private?', a: 'Yes. All data is stored in a private MongoDB database. We never sell or share your trading data with any third parties.' },
  { q: 'What prop firms are supported?', a: 'Our prop tracker works with any firm. You manually configure the drawdown limits, daily loss caps, and targets that match your firm\'s rules.' },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="land">
      {/* ────────────────── NAV ────────────────── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              <div className="nav-logo-icon"><TrendingUp size={13} /></div>
              <span className="nav-logo-text">TradeVault</span>
            </div>
            <div className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#analytics" className="nav-link">Analytics</a>
              <a href="#strategies" className="nav-link">Strategies</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#faq" className="nav-link">FAQ</a>
            </div>
          </div>
          <div className="nav-right">
            <ThemeToggle />
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="nav-btn-ghost">Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="nav-btn-primary">Open Dashboard</button>
                </SignUpButton>
              </>
            ) : (
              <a href="/dashboard" className="nav-btn-primary">
                Dashboard <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ────────────────── HERO ────────────────── */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            Professional Trading Journal
          </div>
          <h1 className="hero-headline">
            Trade Smarter.<br />
            <span className="hero-accent">Improve Faster.</span>
          </h1>
          <p className="hero-sub">
            The all-in-one trading journal with MT5 sync, AI trade reviews, strategy analytics, prop-firm tracking, and advanced performance insights.
          </p>
          <div className="hero-cta">
            {!isSignedIn ? (
              <>
                <SignUpButton mode="modal">
                  <button className="cta-primary">
                    Open Dashboard <ArrowRight size={15} />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="cta-secondary">Sign In</button>
                </SignInButton>
              </>
            ) : (
              <a href="/dashboard" className="cta-primary">
                Go to Dashboard <LayoutDashboard size={15} />
              </a>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-val">50,000+</span>
              <span className="hero-stat-label">Trades Logged</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-val">87%</span>
              <span className="hero-stat-label">User Retention</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-val">10+</span>
              <span className="hero-stat-label">Analytics Modules</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-val">Real-Time</span>
              <span className="hero-stat-label">MT5 Sync</span>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Mockup */}
        <div className="hero-right">
          <div className="mockup-window">
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <span /><span /><span />
              </div>
              <div className="mockup-title">TradeVault — Dashboard</div>
            </div>
            <div className="mockup-body">
              {/* Mini stat cards */}
              <div className="mock-stats">
                {[
                  { label: 'Net Profit', val: '+$5,148', pos: true },
                  { label: 'Win Rate', val: '64.2%', pos: true },
                  { label: 'Profit Factor', val: '2.38', pos: true },
                  { label: 'Max DD', val: '-4.1%', pos: false },
                ].map(s => (
                  <div key={s.label} className="mock-stat">
                    <span className="mock-stat-label">{s.label}</span>
                    <span className={`mock-stat-val ${s.pos ? 'pos' : 'neg'}`}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Mini equity chart */}
              <div className="mock-chart-wrap">
                <div className="mock-chart-title">Equity Curve</div>
                <svg viewBox="0 0 320 80" className="mock-chart-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,65 L40,58 L80,50 L100,52 L130,38 L160,30 L190,22 L210,28 L240,15 L280,10 L320,6" stroke="#2563EB" strokeWidth="1.5" fill="none" />
                  <path d="M0,65 L40,58 L80,50 L100,52 L130,38 L160,30 L190,22 L210,28 L240,15 L280,10 L320,6 L320,80 L0,80 Z" fill="url(#mg)" />
                </svg>
              </div>

              {/* Mini trades table */}
              <div className="mock-table">
                <div className="mock-table-head">
                  <span>Symbol</span><span>Side</span><span>PnL</span><span>RR</span>
                </div>
                {[
                  { sym: 'XAUUSD', dir: 'LONG', pnl: '+$391', rr: '1.96R', pos: true },
                  { sym: 'EURUSD', dir: 'SHORT', pnl: '-$120', rr: '-1.00R', pos: false },
                  { sym: 'US100', dir: 'LONG', pnl: '+$218', rr: '1.45R', pos: true },
                  { sym: 'GBPUSD', dir: 'SHORT', pnl: '+$95', rr: '0.63R', pos: true },
                ].map(r => (
                  <div key={r.sym} className="mock-table-row">
                    <span className="mock-sym">{r.sym}</span>
                    <span className={`mock-dir ${r.dir === 'LONG' ? 'long' : 'short'}`}>{r.dir}</span>
                    <span className={r.pos ? 'pos' : 'neg'}>{r.pnl}</span>
                    <span className="mock-muted">{r.rr}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── TRUST BAR ────────────────── */}
      <div className="trust-bar">
        <span className="trust-label">Trusted by traders using</span>
        {['MetaTrader 5', 'FTMO', 'MyForexFunds', 'The Funded Trader', 'Apex Trader Funding', 'TopstepFX'].map(b => (
          <span key={b} className="trust-item">{b}</span>
        ))}
      </div>

      {/* ────────────────── FEATURES ────────────────── */}
      <section className="land-section" id="features">
        <div className="section-header">
          <h2 className="section-title">Everything you need to build your edge</h2>
          <p className="section-sub">A complete toolkit replacing spreadsheets, notes, and guesswork.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────── MT5 SYNC ────────────────── */}
      <section className="land-section land-section-dark" id="mt5">
        <div className="mt5-wrapper">
          <div className="mt5-left">
            <div className="section-eyebrow">Automated Sync</div>
            <h2 className="section-title">Your trades, journaled automatically.</h2>
            <p className="section-sub" style={{ maxWidth: 400 }}>
              Install our free Expert Advisor in MetaTrader 5. Every closed trade is captured and sent to your TradeVault instantly — including entry, exit, size, symbol, and runtime.
            </p>
            <div className="mt5-steps">
              {[
                'Install the TradeVault EA in MT5',
                'Set your API key in EA inputs',
                'Trade normally — everything syncs',
                'Analyze performance in real-time',
              ].map((s, i) => (
                <div key={i} className="mt5-step">
                  <div className="mt5-step-num">{i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt5-right">
            <div className="arch-diagram">
              {[
                { icon: <Monitor size={16} />, label: 'MetaTrader 5', sub: 'Expert Advisor' },
                { icon: <ArrowRight size={14} />, label: '', sub: '', arrow: true },
                { icon: <Zap size={16} />, label: 'TradeVault API', sub: 'REST Endpoint' },
                { icon: <ArrowRight size={14} />, label: '', sub: '', arrow: true },
                { icon: <Database size={16} />, label: 'MongoDB Atlas', sub: 'Secure Storage' },
                { icon: <ArrowRight size={14} />, label: '', sub: '', arrow: true },
                { icon: <Cpu size={16} />, label: 'Analytics Engine', sub: 'AI Processing' },
                { icon: <ArrowRight size={14} />, label: '', sub: '', arrow: true },
                { icon: <BarChart3 size={16} />, label: 'Dashboard', sub: 'Real-Time View' },
              ].map((node, i) => (
                node.arrow ? (
                  <div key={i} className="arch-arrow">{node.icon}</div>
                ) : (
                  <div key={i} className="arch-node">
                    <div className="arch-node-icon">{node.icon}</div>
                    <span className="arch-node-label">{node.label}</span>
                    <span className="arch-node-sub">{node.sub}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── ANALYTICS ────────────────── */}
      <section className="land-section" id="analytics">
        <div className="section-header">
          <div className="section-eyebrow">Analytics</div>
          <h2 className="section-title">Data-driven performance insights</h2>
          <p className="section-sub">Every metric a professional trader needs, all in one place.</p>
        </div>
        <div className="analytics-grid">
          {[
            { label: 'Equity Curve', val: '+$5,148', desc: 'Track your running balance across every trade', color: '#2563EB', icon: <TrendingUp size={14} /> },
            { label: 'Win Rate', val: '64.2%', desc: 'Win rate broken down by direction and session', color: '#22C55E', icon: <Target size={14} /> },
            { label: 'Profit Factor', val: '2.38', desc: 'Ratio of gross profit to gross loss', color: '#F59E0B', icon: <BarChart2 size={14} /> },
            { label: 'Max Drawdown', val: '-4.1%', desc: 'Peak-to-trough equity decline monitoring', color: '#EF4444', icon: <TrendingDown size={14} /> },
            { label: 'Avg RR', val: '1.54R', desc: 'Risk-to-reward achieved across all trades', color: '#06B6D4', icon: <Activity size={14} /> },
            { label: 'Expectancy', val: '$82.40', desc: 'Average expected return per unit risked', color: '#A78BFA', icon: <BarChart3 size={14} /> },
          ].map(m => (
            <div key={m.label} className="analytics-card card">
              <div className="analytics-card-top">
                <span className="analytics-icon" style={{ color: m.color, background: `${m.color}15` }}>{m.icon}</span>
                <span className="analytics-label">{m.label}</span>
              </div>
              <div className="analytics-val" style={{ color: m.color }}>{m.val}</div>
              <p className="analytics-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────── AI SECTION ────────────────── */}
      <section className="land-section land-section-dark" id="ai">
        <div className="ai-wrapper">
          <div className="ai-left">
            <div className="section-eyebrow">AI-Powered</div>
            <h2 className="section-title">Weekly AI trade reviews, delivered.</h2>
            <p className="section-sub" style={{ maxWidth: 420 }}>
              Every Sunday, our AI analyzes your complete trading week — highlighting strengths, exposing weaknesses, and providing personalized improvement steps. Delivered to your inbox.
            </p>
            <div className="ai-benefits">
              {[
                'Identifies recurring loss patterns',
                'Scores your execution quality',
                'Highlights best-performing setups',
                'Sends weekly email summary',
              ].map(b => (
                <div key={b} className="ai-benefit">
                  <Check size={13} color="#22C55E" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ai-right">
            <div className="ai-card card">
              <div className="ai-card-header">
                <div className="ai-avatar"><BrainCircuit size={14} /></div>
                <div>
                  <div className="ai-card-title">Weekly AI Review</div>
                  <div className="ai-card-date">Week of Jun 23–29, 2026</div>
                </div>
                <div className="ai-score">
                  <span className="ai-score-val">78</span>
                  <span className="ai-score-label">/ 100</span>
                </div>
              </div>
              <div className="ai-section-block">
                <div className="ai-block-title pos">✓ Strengths</div>
                <p className="ai-block-text">Excellent patience on XAUUSD setups. Win rate of 72% on trend-following entries aligns perfectly with your A+ criteria. RR consistency improved vs. last week.</p>
              </div>
              <div className="ai-section-block">
                <div className="ai-block-title neg">✗ Weaknesses</div>
                <p className="ai-block-text">Two revenge trades on Friday after a loss — both stopped out. Your Friday session PnL is consistently negative. Consider no-Friday rule.</p>
              </div>
              <div className="ai-section-block">
                <div className="ai-block-title accent">→ Improvements</div>
                <p className="ai-block-text">Implement a max 2 losses/day rule. Your EURUSD entries are 15min too early — wait for candle close confirmation before entering.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── STRATEGY BUILDER ────────────────── */}
      <section className="land-section" id="strategies">
        <div className="strategy-wrapper">
          <div className="strategy-left">
            <div className="section-eyebrow">Strategy Builder</div>
            <h2 className="section-title">Build, tag, and analyze every strategy.</h2>
            <p className="section-sub" style={{ maxWidth: 420 }}>
              Create named strategies with dynamic parameters. Tag every trade. Then let TradeVault tell you which setups actually make money.
            </p>
            <div className="strategy-steps-flow">
              {[
                { step: 'Create Strategy', detail: 'Name, describe, and categorize your setup' },
                { step: 'Define Parameters', detail: 'Add dynamic confluence factors and conditions' },
                { step: 'Add Checklist', detail: 'Build a pre-trade checklist to enforce discipline' },
                { step: 'Tag Trades', detail: 'Link every trade to its strategy on entry' },
                { step: 'Analyze Results', detail: 'See win rate, PF, and RR broken down per strategy' },
              ].map((s, i) => (
                <div key={i} className="strategy-step">
                  <div className="strategy-step-num">{i + 1}</div>
                  <div>
                    <div className="strategy-step-title">{s.step}</div>
                    <div className="strategy-step-detail">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="strategy-right">
            {/* Example strategy card */}
            <div className="ex-strategy card">
              <div className="ex-strategy-header">
                <div className="ex-icon"><Zap size={14} /></div>
                <div>
                  <div className="ex-name">London Breakout</div>
                  <div className="ex-type">Trend Following · 15M + 1H</div>
                </div>
                <div className="ex-stats">
                  <div className="ex-stat-row"><span>Win Rate</span><span className="ex-val pos">68%</span></div>
                  <div className="ex-stat-row"><span>Profit Factor</span><span className="ex-val pos">2.4</span></div>
                </div>
              </div>
              <div className="ex-params">
                <span className="ex-param">📊 Above 20 EMA</span>
                <span className="ex-param">📍 HTF Structure</span>
                <span className="ex-param">⏰ 08:00-10:00 GMT</span>
                <span className="ex-param">📈 Breakout + Retest</span>
              </div>
              <div className="ex-footer">
                <div className="ex-dot active" />
                <span>Active · 43 trades logged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── PROP FIRM TRACKING ────────────────── */}
      <section className="land-section land-section-dark" id="prop">
        <div className="section-header">
          <div className="section-eyebrow">Prop Firm Tracking</div>
          <h2 className="section-title">Never blow a challenge again.</h2>
          <p className="section-sub">Real-time monitoring of every funded account, drawdown limit, and profit target. Get warned before you breach rules.</p>
        </div>
        <div className="prop-grid">
          {[
            { firm: 'FTMO 100K', phase: 'Phase 1', target: '$10,000', current: '$6,840', dd: '4.2%', maxDD: '10%', safe: true },
            { firm: 'Apex 50K', phase: 'Funded', target: 'No target', current: '$2,150', dd: '1.8%', maxDD: '5%', safe: true },
            { firm: 'The5ers 50K', phase: 'Phase 2', target: '$3,000', current: '$1,920', dd: '3.9%', maxDD: '4%', safe: false },
          ].map(p => (
            <div key={p.firm} className={`prop-card card ${!p.safe ? 'prop-warning' : ''}`}>
              <div className="prop-header">
                <div>
                  <div className="prop-firm">{p.firm}</div>
                  <div className="prop-phase">{p.phase}</div>
                </div>
                <div className={`prop-status ${p.safe ? 'safe' : 'warn'}`}>
                  <Shield size={11} />
                  {p.safe ? 'Safe' : 'Near Limit'}
                </div>
              </div>
              <div className="prop-metrics">
                <div className="prop-metric">
                  <span className="prop-metric-label">Profit Target</span>
                  <span className="prop-metric-val">{p.target}</span>
                </div>
                <div className="prop-metric">
                  <span className="prop-metric-label">Current Profit</span>
                  <span className="prop-metric-val pos">{p.current}</span>
                </div>
                <div className="prop-metric">
                  <span className="prop-metric-label">Drawdown</span>
                  <span className={`prop-metric-val ${!p.safe ? 'warn-text' : ''}`}>{p.dd} / {p.maxDD}</span>
                </div>
              </div>
              <div className="prop-progress-bar-wrap">
                <div className="prop-progress-bar" style={{
                  width: `${Math.min(100, parseFloat(p.dd) / parseFloat(p.maxDD) * 100)}%`,
                  background: p.safe ? '#22C55E' : '#EF4444',
                }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────── PRICING ────────────────── */}
      <section className="land-section" id="pricing">
        <div className="section-header">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title">Simple, transparent pricing.</h2>
          <p className="section-sub">Start free. Upgrade when you're ready to go deeper.</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">$0<span className="pricing-freq">/month</span></div>
            <p className="pricing-desc">Perfect for traders getting started with journaling.</p>
            <ul className="pricing-features">
              {['Up to 100 trades', 'Basic analytics', 'Manual trade entry', 'Calendar view', 'CSV import'].map(f => (
                <li key={f}><Check size={12} color="#22C55E" />{f}</li>
              ))}
            </ul>
            <SignUpButton mode="modal">
              <button className="pricing-cta secondary">Get Started Free</button>
            </SignUpButton>
          </div>
          <div className="pricing-card card pricing-featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-tier">Pro</div>
            <div className="pricing-price">$19<span className="pricing-freq">/month</span></div>
            <p className="pricing-desc">For serious traders who want every edge.</p>
            <ul className="pricing-features">
              {[
                'Unlimited trades',
                'MT5 Auto-Sync',
                'AI weekly reviews',
                'Advanced analytics',
                'Strategy builder',
                'Prop firm tracker',
                'Trade screenshots',
                'PDF + email reports',
                'Pattern discovery',
                'Priority support',
              ].map(f => (
                <li key={f}><Check size={12} color="#2563EB" />{f}</li>
              ))}
            </ul>
            <SignUpButton mode="modal">
              <button className="pricing-cta primary">Start Free Trial</button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* ────────────────── FAQ ────────────────── */}
      <section className="land-section land-section-dark" id="faq">
        <div className="faq-wrapper">
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-title">Common questions</h2>
          </div>
          <div className="faq-list">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronDown size={15} className={`faq-chevron ${openFaq === i ? 'open' : ''}`} />
                </button>
                {openFaq === i && <div className="faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER CTA ────────────────── */}
      <section className="footer-cta-section">
        <div className="footer-cta-inner">
          <h2 className="footer-cta-title">Start journaling your trades today.</h2>
          <p className="footer-cta-sub">Join traders who track, analyze, and improve with TradeVault.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
            {!isSignedIn ? (
              <SignUpButton mode="modal">
                <button className="cta-primary">Open Dashboard Free <ArrowRight size={15} /></button>
              </SignUpButton>
            ) : (
              <a href="/dashboard" className="cta-primary">
                Go to Dashboard <LayoutDashboard size={15} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer className="land-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="nav-logo-icon"><TrendingUp size={12} /></div>
              <span className="footer-logo-text">TradeVault</span>
            </div>
            <p className="footer-tagline">Professional trading journal for serious traders.</p>
          </div>
          <div className="footer-links-group">
            <div className="footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#features">Features</a>
              <a href="#analytics">Analytics</a>
              <a href="#strategies">Strategies</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Resources</span>
              <a href="#faq">FAQ</a>
              <a href="#mt5">MT5 Setup</a>
              <a href="#ai">AI Reviews</a>
              <a href="#prop">Prop Tracking</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 TradeVault. All rights reserved.</span>
          <span>Built for professional traders.</span>
        </div>
      </footer>

      <style jsx>{`
        /* ── Container ── */
        .land {
          min-height: 100vh;
          background: var(--color-background);
          color: var(--color-foreground);
          font-family: var(--font-sans);
        }

        /* ── Navbar ── */
        .land-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10,10,10,0.85);
          border-bottom: 1px solid var(--color-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .land-nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-left { display: flex; align-items: center; gap: 32px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; }
        .nav-logo-icon {
          width: 24px; height: 24px; border-radius: 6px;
          background: var(--color-accent);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
        }
        .nav-logo-text {
          font-size: 0.9375rem; font-weight: 650;
          letter-spacing: -0.02em; color: var(--color-foreground);
        }
        .nav-links { display: flex; align-items: center; gap: 0; }
        .nav-link {
          padding: 6px 12px; font-size: 0.8125rem; font-weight: 500;
          color: var(--color-muted-foreground); text-decoration: none;
          border-radius: 5px; transition: color 0.12s, background 0.12s;
        }
        .nav-link:hover { color: var(--color-foreground); background: var(--color-border-subtle); }
        @media (max-width: 768px) { .nav-links { display: none; } }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .nav-btn-ghost {
          background: none; border: none; padding: 6px 12px;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--color-muted-foreground); cursor: pointer;
          border-radius: 5px; font-family: inherit;
          transition: color 0.12s, background 0.12s;
        }
        .nav-btn-ghost:hover { color: var(--color-foreground); background: var(--color-border-subtle); }
        .nav-btn-primary {
          background: var(--color-accent);
          color: white; border: none; padding: 7px 14px;
          border-radius: 6px; font-size: 0.8125rem; font-weight: 500;
          cursor: pointer; font-family: inherit;
          transition: background 0.12s;
          display: inline-flex; align-items: center; gap: 6px;
          text-decoration: none;
        }
        .nav-btn-primary:hover { background: var(--color-accent-hover); }

        /* ── Hero ── */
        .hero-section {
          min-height: 100vh; padding: 80px 5% 60px;
          display: flex; align-items: center; gap: 60px;
          max-width: 1200px; margin: 0 auto;
        }
        @media (max-width: 960px) {
          .hero-section { flex-direction: column; padding: 100px 5% 60px; min-height: auto; gap: 40px; }
        }
        .hero-left { flex: 1; max-width: 520px; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.6875rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--color-accent); margin-bottom: 20px;
        }
        .hero-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 8px var(--color-accent);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        .hero-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800; letter-spacing: -0.05em; line-height: 1.08;
          color: var(--color-foreground); margin-bottom: 20px;
        }
        .hero-accent { color: var(--color-accent); }
        .hero-sub {
          font-size: 1rem; line-height: 1.65;
          color: var(--color-muted-foreground); margin-bottom: 32px;
          max-width: 460px;
        }
        .hero-cta { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; flex-wrap: wrap; }
        .cta-primary {
          background: var(--color-accent); color: white;
          border: none; padding: 11px 20px;
          border-radius: 7px; font-size: 0.9375rem; font-weight: 600;
          cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none; transition: background 0.12s, transform 0.12s;
          letter-spacing: -0.01em;
        }
        .cta-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
        .cta-secondary {
          background: transparent; color: var(--color-foreground);
          border: 1px solid var(--color-border); padding: 11px 20px;
          border-radius: 7px; font-size: 0.9375rem; font-weight: 500;
          cursor: pointer; font-family: inherit;
          transition: border-color 0.12s, background 0.12s;
        }
        .cta-secondary:hover { border-color: #3F3F46; background: var(--color-border-subtle); }

        /* Hero stats */
        .hero-stats { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .hero-stat { display: flex; flex-direction: column; gap: 2px; }
        .hero-stat-val { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.03em; color: var(--color-foreground); }
        .hero-stat-label { font-size: 0.6875rem; color: var(--color-placeholder); text-transform: uppercase; letter-spacing: 0.06em; }
        .hero-stat-div { width: 1px; height: 28px; background: var(--color-border); }

        /* Hero Mockup */
        .hero-right { flex: 1; max-width: 560px; width: 100%; }
        .mockup-window {
          background: #111111; border: 1px solid #262626; border-radius: 10px;
          overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.8);
        }
        .mockup-topbar {
          background: #0A0A0A; border-bottom: 1px solid #1C1C1C;
          padding: 10px 14px; display: flex; align-items: center; gap: 8px;
        }
        .mockup-dots { display: flex; gap: 5px; }
        .mockup-dots span {
          width: 9px; height: 9px; border-radius: 50%;
          background: #262626; display: block;
        }
        .mockup-title { font-size: 0.6875rem; color: #52525B; margin: 0 auto; letter-spacing: 0.02em; }
        .mockup-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }

        .mock-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .mock-stat {
          background: #0A0A0A; border: 1px solid #1C1C1C; border-radius: 5px;
          padding: 8px 10px; display: flex; flex-direction: column; gap: 3px;
        }
        .mock-stat-label { font-size: 0.5625rem; text-transform: uppercase; letter-spacing: 0.06em; color: #52525B; }
        .mock-stat-val { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.03em; }
        .mock-stat-val.pos { color: #22C55E; }
        .mock-stat-val.neg { color: #EF4444; }

        .mock-chart-wrap {
          background: #0A0A0A; border: 1px solid #1C1C1C; border-radius: 5px; padding: 10px 12px;
        }
        .mock-chart-title { font-size: 0.625rem; color: #52525B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .mock-chart-svg { width: 100%; height: 60px; }

        .mock-table { background: #0A0A0A; border: 1px solid #1C1C1C; border-radius: 5px; overflow: hidden; }
        .mock-table-head, .mock-table-row {
          display: grid; grid-template-columns: 1fr 60px 70px 60px;
          padding: 6px 10px; font-size: 0.5625rem;
        }
        .mock-table-head { color: #52525B; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #1C1C1C; }
        .mock-table-row { color: #A1A1AA; border-bottom: 1px solid #111111; transition: background 0.1s; }
        .mock-table-row:last-child { border-bottom: none; }
        .mock-table-row:hover { background: #111111; }
        .mock-sym { font-weight: 600; color: #FAFAFA; font-size: 0.625rem; letter-spacing: 0.02em; }
        .mock-dir {
          display: inline-flex; padding: 1px 5px; border-radius: 2px;
          font-size: 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
          align-self: center;
        }
        .mock-dir.long { background: rgba(37,99,235,0.15); color: #60A5FA; }
        .mock-dir.short { background: rgba(245,158,11,0.15); color: #F59E0B; }
        .mock-muted { color: #52525B; font-size: 0.5625rem; }
        .pos { color: #22C55E; font-weight: 600; font-size: 0.5625rem; }
        .neg { color: #EF4444; font-weight: 600; font-size: 0.5625rem; }

        /* ── Trust Bar ── */
        .trust-bar {
          border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border);
          padding: 14px 5%; display: flex; align-items: center; gap: 20px;
          overflow-x: auto; background: var(--color-surface);
        }
        .trust-label { font-size: 0.6875rem; color: var(--color-placeholder); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; flex-shrink: 0; }
        .trust-item {
          font-size: 0.75rem; font-weight: 600; color: var(--color-muted-foreground);
          white-space: nowrap; letter-spacing: -0.01em;
          padding: 4px 10px; background: var(--color-border-subtle);
          border: 1px solid var(--color-border); border-radius: 4px;
        }

        /* ── Sections ── */
        .land-section {
          padding: 80px 5%;
          max-width: 1200px; margin: 0 auto;
        }
        .land-section-dark {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          max-width: none; padding: 80px 5%;
        }
        .land-section-dark > * { max-width: 1200px; margin: 0 auto; }

        .section-eyebrow {
          font-size: 0.6875rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--color-accent); margin-bottom: 10px;
        }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-title {
          font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700;
          letter-spacing: -0.04em; color: var(--color-foreground); margin-bottom: 10px;
        }
        .section-sub { font-size: 0.9375rem; color: var(--color-muted-foreground); max-width: 540px; margin: 0 auto; }

        /* ── Features ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1px;
          border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden;
        }
        .feature-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 20px 22px; background: var(--color-card);
          transition: background 0.12s;
        }
        .feature-card:hover { background: var(--color-card-hover); }
        .feature-icon {
          width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-accent);
        }
        .feature-title { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); margin-bottom: 4px; letter-spacing: -0.01em; }
        .feature-desc { font-size: 0.8125rem; color: var(--color-muted-foreground); line-height: 1.5; margin: 0; }

        /* ── MT5 Sync ── */
        .mt5-wrapper { display: flex; align-items: flex-start; gap: 60px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 900px) { .mt5-wrapper { flex-direction: column; gap: 40px; } }
        .mt5-left { flex: 1; max-width: 440px; }
        .mt5-right { flex: 1; }
        .mt5-steps { display: flex; flex-direction: column; gap: 14px; margin-top: 28px; }
        .mt5-step { display: flex; align-items: center; gap: 12px; }
        .mt5-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          color: var(--color-accent); font-size: 0.6875rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mt5-step span { font-size: 0.875rem; color: var(--color-muted-foreground); }

        .arch-diagram {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          background: var(--color-card); border: 1px solid var(--color-border);
          border-radius: 10px; padding: 24px;
        }
        .arch-node {
          background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 8px; padding: 14px 20px; width: 100%;
          display: flex; align-items: center; gap: 12px;
        }
        .arch-node-icon {
          width: 32px; height: 32px; border-radius: 6px;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-accent); flex-shrink: 0;
        }
        .arch-node-label { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); letter-spacing: -0.01em; }
        .arch-node-sub { font-size: 0.6875rem; color: var(--color-placeholder); margin-left: auto; }
        .arch-arrow { color: var(--color-border); }

        /* ── Analytics ── */
        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .analytics-card { padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
        .analytics-card-top { display: flex; align-items: center; gap: 10px; }
        .analytics-icon {
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .analytics-label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-placeholder); }
        .analytics-val { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.05em; }
        .analytics-desc { font-size: 0.8125rem; color: var(--color-muted-foreground); margin: 0; line-height: 1.45; }

        /* ── AI Section ── */
        .ai-wrapper { display: flex; align-items: flex-start; gap: 60px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 900px) { .ai-wrapper { flex-direction: column; gap: 40px; } }
        .ai-left { flex: 1; max-width: 400px; }
        .ai-right { flex: 1; }
        .ai-benefits { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .ai-benefit { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: var(--color-muted-foreground); }
        .ai-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .ai-card-header { display: flex; align-items: center; gap: 12px; }
        .ai-avatar {
          width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          display: flex; align-items: center; justify-content: center; color: var(--color-accent);
        }
        .ai-card-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); letter-spacing: -0.01em; }
        .ai-card-date { font-size: 0.6875rem; color: var(--color-placeholder); }
        .ai-score { margin-left: auto; text-align: right; }
        .ai-score-val { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em; color: var(--color-foreground); }
        .ai-score-label { font-size: 0.75rem; color: var(--color-placeholder); }
        .ai-section-block { display: flex; flex-direction: column; gap: 6px; padding: 14px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 6px; }
        .ai-block-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .ai-block-title.pos { color: var(--color-success); }
        .ai-block-title.neg { color: var(--color-loss); }
        .ai-block-title.accent { color: var(--color-accent); }
        .ai-block-text { font-size: 0.8125rem; color: var(--color-muted-foreground); margin: 0; line-height: 1.55; }

        /* ── Strategy ── */
        .strategy-wrapper { display: flex; align-items: flex-start; gap: 60px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 900px) { .strategy-wrapper { flex-direction: column; gap: 40px; } }
        .strategy-left { flex: 1; max-width: 420px; }
        .strategy-right { flex: 1; }
        .strategy-steps-flow { display: flex; flex-direction: column; gap: 14px; margin-top: 28px; }
        .strategy-step { display: flex; align-items: flex-start; gap: 14px; }
        .strategy-step-num {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          color: var(--color-accent); font-size: 0.6875rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .strategy-step-title { font-size: 0.875rem; font-weight: 600; color: var(--color-foreground); letter-spacing: -0.01em; }
        .strategy-step-detail { font-size: 0.8125rem; color: var(--color-muted-foreground); }

        .ex-strategy { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .ex-strategy-header { display: flex; align-items: flex-start; gap: 12px; }
        .ex-icon {
          width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
          background: var(--color-accent-subtle); border: 1px solid var(--color-accent-muted);
          display: flex; align-items: center; justify-content: center; color: var(--color-accent);
        }
        .ex-name { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); letter-spacing: -0.01em; }
        .ex-type { font-size: 0.6875rem; color: var(--color-placeholder); margin-top: 2px; }
        .ex-stats { margin-left: auto; display: flex; flex-direction: column; gap: 4px; text-align: right; }
        .ex-stat-row { display: flex; align-items: center; gap: 8px; font-size: 0.6875rem; color: var(--color-placeholder); }
        .ex-val { font-weight: 700; color: var(--color-foreground); }
        .ex-val.pos { color: var(--color-success); }
        .ex-params { display: flex; flex-wrap: wrap; gap: 6px; }
        .ex-param { font-size: 0.6875rem; padding: 3px 8px; background: var(--color-border-subtle); border: 1px solid var(--color-border); border-radius: 3px; color: var(--color-muted-foreground); }
        .ex-footer { display: flex; align-items: center; gap: 6px; font-size: 0.6875rem; color: var(--color-placeholder); border-top: 1px solid var(--color-border-subtle); padding-top: 10px; }
        .ex-dot { width: 5px; height: 5px; border-radius: 50%; }
        .ex-dot.active { background: var(--color-success); box-shadow: 0 0 5px var(--color-success); }

        /* ── Prop Firm ── */
        .prop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; max-width: 1200px; margin: 0 auto; }
        .prop-card { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
        .prop-warning { border-color: rgba(239,68,68,0.3); }
        .prop-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .prop-firm { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); letter-spacing: -0.01em; }
        .prop-phase { font-size: 0.6875rem; color: var(--color-placeholder); margin-top: 2px; }
        .prop-status { display: flex; align-items: center; gap: 5px; font-size: 0.6875rem; font-weight: 600; padding: 3px 8px; border-radius: 3px; }
        .prop-status.safe { background: var(--color-success-muted); color: var(--color-success); }
        .prop-status.warn { background: var(--color-loss-muted); color: var(--color-loss); }
        .prop-metrics { display: flex; flex-direction: column; gap: 8px; }
        .prop-metric { display: flex; justify-content: space-between; align-items: center; }
        .prop-metric-label { font-size: 0.6875rem; color: var(--color-placeholder); }
        .prop-metric-val { font-size: 0.8125rem; font-weight: 600; color: var(--color-foreground); }
        .prop-metric-val.pos { color: var(--color-success); }
        .prop-metric-val.warn-text { color: var(--color-loss); }
        .prop-progress-bar-wrap { height: 3px; background: var(--color-border); border-radius: 99px; overflow: hidden; }
        .prop-progress-bar { height: 100%; border-radius: 99px; transition: width 0.5s; }

        /* ── Pricing ── */
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; max-width: 720px; margin: 0 auto; }
        .pricing-card { padding: 28px; display: flex; flex-direction: column; gap: 14px; position: relative; }
        .pricing-featured { border-color: var(--color-accent); }
        .pricing-badge {
          position: absolute; top: -1px; right: 20px;
          background: var(--color-accent); color: white;
          font-size: 0.5625rem; font-weight: 700; padding: 3px 8px;
          border-radius: 0 0 5px 5px; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .pricing-tier { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-placeholder); }
        .pricing-price { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.06em; color: var(--color-foreground); }
        .pricing-freq { font-size: 0.875rem; font-weight: 500; color: var(--color-placeholder); letter-spacing: 0; }
        .pricing-desc { font-size: 0.8125rem; color: var(--color-muted-foreground); margin: 0; }
        .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 9px; flex: 1; }
        .pricing-features li { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--color-muted-foreground); }
        .pricing-cta {
          padding: 10px 16px; border-radius: 6px; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.12s; border: none;
        }
        .pricing-cta.primary { background: var(--color-accent); color: white; }
        .pricing-cta.primary:hover { background: var(--color-accent-hover); }
        .pricing-cta.secondary { background: transparent; color: var(--color-foreground); border: 1px solid var(--color-border); }
        .pricing-cta.secondary:hover { background: var(--color-border-subtle); }

        /* ── FAQ ── */
        .faq-wrapper { max-width: 720px; margin: 0 auto; }
        .faq-list { display: flex; flex-direction: column; gap: 0; }
        .faq-item { border-bottom: 1px solid var(--color-border); }
        .faq-q {
          width: 100%; background: none; border: none; text-align: left;
          padding: 18px 0; font-size: 0.9375rem; font-weight: 500;
          color: var(--color-foreground); cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          letter-spacing: -0.01em; transition: color 0.12s;
        }
        .faq-q:hover { color: var(--color-accent); }
        :global(.faq-chevron) { flex-shrink: 0; transition: transform 0.2s; color: var(--color-placeholder); }
        :global(.faq-chevron.open) { transform: rotate(180deg); }
        .faq-a {
          padding-bottom: 16px; font-size: 0.875rem;
          color: var(--color-muted-foreground); line-height: 1.6;
        }

        /* ── Footer CTA ── */
        .footer-cta-section {
          padding: 80px 5%;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
        }
        .footer-cta-inner { max-width: 600px; margin: 0 auto; text-align: center; }
        .footer-cta-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.04em; color: var(--color-foreground); margin-bottom: 10px; }
        .footer-cta-sub { font-size: 0.9375rem; color: var(--color-muted-foreground); }

        /* ── Footer ── */
        .land-footer {
          border-top: 1px solid var(--color-border);
          background: var(--color-background);
          padding: 40px 5% 24px;
        }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; margin-bottom: 32px; }
        .footer-brand { max-width: 260px; }
        .footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .footer-logo-text { font-size: 0.875rem; font-weight: 650; color: var(--color-foreground); letter-spacing: -0.02em; }
        .footer-tagline { font-size: 0.8125rem; color: var(--color-placeholder); }
        .footer-links-group { display: flex; gap: 40px; }
        .footer-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.09em; color: var(--color-placeholder); margin-bottom: 4px; }
        .footer-col a { font-size: 0.8125rem; color: var(--color-muted-foreground); text-decoration: none; transition: color 0.12s; }
        .footer-col a:hover { color: var(--color-foreground); }
        .footer-bottom {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 0.6875rem; color: var(--color-placeholder);
          border-top: 1px solid var(--color-border-subtle); padding-top: 20px;
          flex-wrap: wrap; gap: 10px;
        }
      `}</style>
    </div>
  );
}
