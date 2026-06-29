'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ArrowRight, BarChart3, Calendar, Mail, Zap, LayoutDashboard, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon"><BarChart3 size={20} /></div>
          <span className="logo-text">TradeVault</span>
        </div>
        <div className="nav-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-login">Log in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-signup">Get Started</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn-dashboard">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
        
        <div className="hero-content">
          <div className="badge-pill">
            <span className="sparkle">✨</span> The Ultimate Trading Journal
          </div>
          <h1 className="hero-title">
            Master Your Edge.<br/>
            <span className="text-gradient">Dominate the Markets.</span>
          </h1>
          <p className="hero-subtitle">
            Automated MT5 syncing, deep AI-powered analytics, and interactive performance tracking. Built for serious traders who want to scale their consistency.
          </p>
          
          <div className="hero-cta">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary">
                  Start Journaling Free <ArrowRight size={18} />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-primary">
                Open Dashboard <LayoutDashboard size={18} />
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="features-section">
        <div className="features-header">
          <h2>Everything you need to become profitable.</h2>
          <p>We replaced the spreadsheets with intelligent automated systems.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper i-blue">
              <Zap size={24} />
            </div>
            <h3>Automated MT5 Sync</h3>
            <p>Connect our custom Expert Advisor and your trades will instantly appear in your journal the second you close them in MetaTrader 5.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper i-purple">
              <BrainCircuit size={24} />
            </div>
            <h3>Weekly AI Reviews</h3>
            <p>Every weekend, our AI analyzes your performance, win rates, and mistakes, sending a personalized improvement report directly to your inbox.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper i-green">
              <BarChart3 size={24} />
            </div>
            <h3>Advanced Analytics</h3>
            <p>Break down your edge by Long vs Short, track your exact Profit Factor, and visualize your win rate per individual strategy.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper i-orange">
              <Calendar size={24} />
            </div>
            <h3>Interactive Calendar</h3>
            <p>See your daily PnL on a beautiful heatmap. Click any day to instantly pull up the exact setups and screenshots you took.</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="footer-cta">
        <h2>Ready to track your success?</h2>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="btn-primary large">Create Your Free Account</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="btn-primary large">Go to Dashboard</Link>
        </SignedIn>
        <p className="copyright">© 2026 TradeVault. Built for traders.</p>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-background);
          color: var(--color-foreground);
          overflow-x: hidden;
          font-family: var(--font-inter), sans-serif;
        }

        /* Navbar */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 5%;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          background: rgba(var(--background-rgb), 0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border-subtle);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 10px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .btn-login {
          background: transparent;
          border: none;
          color: var(--color-muted-foreground);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .btn-login:hover { color: var(--color-foreground); }
        .btn-signup, .btn-dashboard {
          background: var(--color-foreground);
          color: var(--color-background);
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none;
        }
        .btn-signup:hover, .btn-dashboard:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        /* Hero */
        .hero {
          position: relative;
          padding: 180px 5% 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 80vh;
        }
        .glow-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          opacity: 0.4;
          animation: float 10s infinite ease-in-out alternate;
        }
        .sphere-1 {
          width: 400px; height: 400px;
          background: rgba(59, 130, 246, 0.5);
          top: -100px; left: -100px;
        }
        .sphere-2 {
          width: 500px; height: 500px;
          background: rgba(139, 92, 246, 0.4);
          bottom: -150px; right: -150px;
          animation-delay: -5s;
        }
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .badge-pill {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .hero-title {
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0 0 24px;
        }
        .text-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--color-muted-foreground);
          line-height: 1.6;
          max-width: 650px;
          margin: 0 0 48px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.125rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }
        .btn-primary.large {
          padding: 20px 40px;
          font-size: 1.25rem;
        }

        /* Features */
        .features-section {
          padding: 80px 5% 120px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .features-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .features-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }
        .features-header p {
          font-size: 1.125rem;
          color: var(--color-muted-foreground);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border-subtle);
          padding: 32px;
          border-radius: 20px;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: var(--color-border);
        }
        .feature-icon-wrapper {
          width: 56px; height: 56px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .i-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .i-purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .i-green { background: rgba(34,197,94,0.1); color: #22c55e; }
        .i-orange { background: rgba(249,115,22,0.1); color: #f97316; }
        
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }
        .feature-card p {
          color: var(--color-muted-foreground);
          line-height: 1.6;
          margin: 0;
          font-size: 0.95rem;
        }

        /* Footer */
        .footer-cta {
          padding: 100px 5%;
          text-align: center;
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          position: relative;
          z-index: 10;
        }
        .footer-cta h2 {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 40px;
        }
        .copyright {
          margin-top: 80px;
          color: var(--color-placeholder);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero { padding-top: 140px; }
          .features-header h2 { font-size: 2rem; }
          .footer-cta h2 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
