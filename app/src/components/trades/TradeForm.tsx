'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTradeAction, updateTradeAction } from '@/actions/trade.actions';
import type { Trade, TradeFormData, TradeSession, TradeEmotion } from '@/types/trade.types';
import type { Strategy } from '@/types/strategy.types';
import type { TradingAccount } from '@/types/ai.types';
import { ChecklistPanel } from './ChecklistPanel';
import { formatDate } from '@/lib/utils';
import { Info } from 'lucide-react';

const SESSIONS: TradeSession[] = ['London', 'New York', 'Asian', 'Sydney', 'London/NY Overlap', 'Other'];
const EMOTIONS: TradeEmotion[] = ['Calm', 'FOMO', 'Fearful', 'Greedy', 'Confident', 'Overconfident', 'Anxious', 'Neutral'];

interface TradeFormProps {
  accounts: TradingAccount[];
  strategies: Strategy[];
  trade?: Trade;
}

export function TradeForm({ accounts, strategies, trade }: TradeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [accountId, setAccountId] = useState(trade?.accountId ?? accounts[0]?._id ?? '');
  const [strategyId, setStrategyId] = useState(trade?.strategyId ?? '');
  const [symbol, setSymbol] = useState(trade?.symbol ?? '');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>(trade?.direction ?? 'LONG');
  const [entryPrice, setEntryPrice] = useState(trade?.entryPrice?.toString() ?? '');
  const [exitPrice, setExitPrice] = useState(trade?.exitPrice?.toString() ?? '');
  const [stopLoss, setStopLoss] = useState(trade?.stopLoss?.toString() ?? '');
  const [takeProfit, setTakeProfit] = useState(trade?.takeProfit?.toString() ?? '');
  const [lotSize, setLotSize] = useState(trade?.lotSize?.toString() ?? '1');
  const [pnl, setPnl] = useState(trade?.pnl?.toString() ?? '');
  const [rr, setRr] = useState(trade?.rr?.toString() ?? '');
  const [tradeDate, setTradeDate] = useState(
    trade?.tradeDate ? formatDate(trade.tradeDate, "yyyy-MM-dd'T'HH:mm") : ''
  );

  useEffect(() => {
    if (!trade?.tradeDate) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setTradeDate(now.toISOString().slice(0, 16));
    }
  }, [trade]);

  const [session, setSession] = useState<TradeSession | ''>(trade?.session as TradeSession ?? '');
  const [status, setStatus] = useState<'open' | 'closed'>(trade?.status as 'open' | 'closed' ?? 'closed');
  const [tags, setTags] = useState(trade?.tags?.join(', ') ?? '');
  const [screenshots, setScreenshots] = useState<string[]>(trade?.screenshots ?? []);

  // Dynamic params
  const [paramValues, setParamValues] = useState<Record<string, unknown>>(trade?.parameterValues ?? {});
  const [checklistValues, setChecklistValues] = useState<Record<string, boolean>>(trade?.checklistValues ?? {});

  // Notes
  const [idea, setIdea] = useState(trade?.notes?.idea ?? '');
  const [mistakes, setMistakes] = useState(trade?.notes?.mistakes ?? '');
  const [lessons, setLessons] = useState(trade?.notes?.lessons ?? '');
  const [emotion, setEmotion] = useState<TradeEmotion | ''>(trade?.notes?.emotion as TradeEmotion ?? '');

  const selectedStrategy = strategies.find((s) => s._id === strategyId);

  // Auto-calc RR
  useEffect(() => {
    const ep = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const pnlVal = parseFloat(pnl);
    if (!isNaN(ep) && !isNaN(sl) && !isNaN(pnlVal) && sl !== ep) {
      const risk = Math.abs(ep - sl);
      const calcRR = Math.abs(pnlVal) / risk;
      if (isFinite(calcRR)) {
        setRr(calcRR.toFixed(2));
      }
    }
  }, [entryPrice, stopLoss, pnl]);

  function handleParamChange(key: string, value: unknown) {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }

  // --- AI Auto-fill ---
  const [isExtracting, setIsExtracting] = useState(false);
  const hasScreenshotsRef = useRef(screenshots.length > 0);
  
  useEffect(() => {
    hasScreenshotsRef.current = screenshots.length > 0;
  }, [screenshots.length]);

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) extractTradeFromImage(blob);
          break;
        }
      }
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  async function extractTradeFromImage(file: File) {
    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const isReferenceImage = hasScreenshotsRef.current;
        if (isReferenceImage) toast.info('Uploading reference image...');
        else toast.info('Analyzing screenshot with AI...');
        
        const res = await fetch('/api/ai/extract-trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, skipExtraction: isReferenceImage }),
        });
        
        const json = await res.json();
        
        if (res.ok) {
          if (json.imageUrl) {
            setScreenshots((prev) => [...prev, json.imageUrl]);
          }

          if (json.data) {
            const { symbol, direction, entryPrice, exitPrice, stopLoss, takeProfit, lotSize, pnl, rr, session, tradeDate: aiTradeDate } = json.data;
            
            if (symbol) setSymbol(symbol);
            if (direction) setDirection(direction as 'LONG' | 'SHORT');
            if (entryPrice) setEntryPrice(entryPrice.toString());
            if (exitPrice) setExitPrice(exitPrice.toString());
            if (stopLoss) setStopLoss(stopLoss.toString());
            
            if (takeProfit) {
              setTakeProfit(takeProfit.toString());
            } else if (exitPrice) {
              setTakeProfit(exitPrice.toString());
            }

            if (lotSize) setLotSize(lotSize.toString());
            if (pnl) setPnl(pnl.toString());
            if (rr) setRr(rr.toString());
            if (session && SESSIONS.includes(session as any)) setSession(session as TradeSession);
            if (aiTradeDate) setTradeDate(aiTradeDate);
            if (exitPrice && pnl) setStatus('closed');
            
            toast.success('Trade details extracted successfully!');
          } else {
            toast.success('Reference image uploaded successfully!');
          }
        } else {
          toast.error(json.error || 'Failed to process image');
        }
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast.error('Failed to process image');
      setIsExtracting(false);
    }
  }

  function renderDynamicField(param: Strategy['parameters'][number]) {
    const value = paramValues[param.key];

    switch (param.type) {
      case 'boolean':
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <div className="bool-group">
              {['Yes', 'No'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`bool-btn ${value === opt ? 'active' : ''}`}
                  onClick={() => handleParamChange(param.key, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <select
              value={(value as string) ?? ''}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              className="form-select"
            >
              <option value="">Select...</option>
              {param.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <div className="multi-group">
              {param.options?.map((opt) => {
                const selected = Array.isArray(value) && (value as string[]).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`multi-btn ${selected ? 'active' : ''}`}
                    onClick={() => {
                      const current = (Array.isArray(value) ? value : []) as string[];
                      handleParamChange(
                        param.key,
                        selected ? current.filter((v) => v !== opt) : [...current, opt]
                      );
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <input
              type="number"
              step="any"
              placeholder={param.label}
              value={(value as number | '') ?? ''}
              onChange={(e) => handleParamChange(param.key, e.target.value ? parseFloat(e.target.value) : '')}
              className="form-input"
            />
          </div>
        );

      case 'rating':
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <div className="rating-group">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rating-btn ${value === n ? 'active' : ''}`}
                  onClick={() => handleParamChange(param.key, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        );

      default: // text, date
        return (
          <div className="field" key={param.key}>
            <label className="field-label">{param.label}{param.required && ' *'}</label>
            <input
              type={param.type === 'date' ? 'date' : 'text'}
              placeholder={param.label}
              value={(value as string) ?? ''}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              className="form-input"
            />
          </div>
        );
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required checklist items
    if (selectedStrategy) {
      const requiredChecklist = (selectedStrategy.checklist || []).filter((c) => c.required);
      const allChecked = requiredChecklist.every((c) => checklistValues[c.id]);
      if (!allChecked) {
        toast.error('Complete all required checklist items before saving');
        return;
      }

      // Validate required parameters
      const requiredParams = (selectedStrategy.parameters || []).filter((p) => p.required);
      const allFilled = requiredParams.every((p) => {
        const v = paramValues[p.key];
        return v !== undefined && v !== '' && v !== null;
      });
      if (!allFilled) {
        toast.error('Fill in all required strategy parameters');
        return;
      }
    }

    const formData: TradeFormData = {
      accountId,
      strategyId: strategyId || undefined,
      symbol: symbol.toUpperCase().trim(),
      direction,
      entryPrice: parseFloat(entryPrice),
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      lotSize: parseFloat(lotSize) || 1,
      pnl: pnl ? parseFloat(pnl) : undefined,
      rr: rr ? parseFloat(rr) : undefined,
      tradeDate,
      session: session || undefined,
      status,
      parameterValues: paramValues,
      checklistValues,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
      notes: {
        idea: idea || undefined,
        mistakes: mistakes || undefined,
        lessons: lessons || undefined,
        emotion: emotion || undefined,
      },
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    };

    startTransition(async () => {
      const result = trade
        ? await updateTradeAction(trade._id, formData)
        : await createTradeAction(formData);

      if ('error' in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(trade ? 'Trade updated!' : 'Trade logged!');
        router.push('/trades');
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      {/* AI Paste Zone */}
      <div className={`ai-paste-zone ${isExtracting ? 'extracting' : ''}`}>
        <div className="paste-content">
          {isExtracting ? (
            <>
              <span className="spinner ai-spinner" />
              <p>{screenshots.length > 0 ? 'Uploading reference image...' : 'Gemini AI is analyzing your screenshot...'}</p>
            </>
          ) : (
            <>
              <div className="paste-icon">✨</div>
              <p style={{ margin: '0 0 8px 0', color: 'var(--color-foreground)' }}><strong>Screenshot Autofill & Gallery</strong> (Ctrl+V)</p>
              <ol style={{ textAlign: 'left', margin: '0 auto', maxWidth: '400px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--color-muted-foreground)', fontSize: '0.8125rem' }}>
                <li><strong>1st Image:</strong> Paste MT5 or terminal screenshot for AI auto-fill.</li>
                <li><strong>2nd Image:</strong> Paste TradingView screenshot as a reference.</li>
              </ol>
            </>
          )}
        </div>
      </div>

      {/* Core Trade Info */}
      <div className="form-section card">
        <h3 className="section-title">Trade Details</h3>
        <div className="form-grid-3">
          <div className="field col-span-1">
            <label className="field-label">Account *</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="form-select" id="select-account">
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>{a.accountName} ({a.currency})</option>
              ))}
            </select>
          </div>
          <div className="field col-span-1">
            <label className="field-label">Strategy</label>
            <select value={strategyId} onChange={(e) => { setStrategyId(e.target.value); setParamValues({}); setChecklistValues({}); }} className="form-select" id="select-strategy">
              <option value="">No Strategy</option>
              {strategies.filter((s) => s.isActive).map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="field col-span-1">
            <label className="field-label">Session</label>
            <select value={session} onChange={(e) => setSession(e.target.value as TradeSession)} className="form-select" id="select-session">
              <option value="">Select Session</option>
              {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-grid-3">
          <div className="field">
            <label className="field-label">Symbol *</label>
            <input id="input-symbol" type="text" placeholder="XAUUSD" value={symbol} onChange={(e) => setSymbol(e.target.value)} required className="form-input" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="field">
            <label className="field-label">Direction *</label>
            <div className="direction-group">
              <button type="button" className={`dir-btn long ${direction === 'LONG' ? 'active' : ''}`} onClick={() => setDirection('LONG')} id="btn-direction-long">LONG</button>
              <button type="button" className={`dir-btn short ${direction === 'SHORT' ? 'active' : ''}`} onClick={() => setDirection('SHORT')} id="btn-direction-short">SHORT</button>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Status</label>
            <div className="direction-group">
              <button type="button" className={`dir-btn ${status === 'closed' ? 'active' : ''}`} onClick={() => setStatus('closed')}>Closed</button>
              <button type="button" className={`dir-btn ${status === 'open' ? 'active open' : ''}`} onClick={() => setStatus('open')}>Open</button>
            </div>
          </div>
        </div>

        <div className="form-grid-3">
          <div className="field">
            <label className="field-label">Entry Price *</label>
            <input id="input-entry" type="number" step="any" placeholder="0.00" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} required className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Exit Price</label>
            <input id="input-exit" type="number" step="any" placeholder="0.00" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Lot Size</label>
            <input id="input-lot-size" type="number" step="any" placeholder="1.00" value={lotSize} onChange={(e) => setLotSize(e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="field">
            <label className="field-label">Stop Loss</label>
            <input id="input-sl" type="number" step="any" placeholder="0.00" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Take Profit</label>
            <input id="input-tp" type="number" step="any" placeholder="0.00" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Trade Date & Time *</label>
            <input id="input-date" type="datetime-local" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} required className="form-input" />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="field">
            <label className="field-label">PnL ($)</label>
            <input id="input-pnl" type="number" step="any" placeholder="e.g. 250 or -120" value={pnl} onChange={(e) => setPnl(e.target.value)} className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Risk:Reward</label>
            <input id="input-rr" type="number" step="any" placeholder="Auto-calculated" value={rr} onChange={(e) => setRr(e.target.value)} className="form-input" />
          </div>
          <div className="field">
            <label className="field-label">Tags</label>
            <input id="input-tags" type="text" placeholder="fvg, sweep, bos (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="form-input" />
          </div>
        </div>
      </div>

      {/* Dynamic Strategy Parameters */}
      {selectedStrategy && selectedStrategy.parameters?.length > 0 && (
        <div className="form-section card">
          <div className="strategy-label">
            <Info size={14} color="#3b82f6" />
            <h3 className="section-title" style={{ margin: 0 }}>
              {selectedStrategy.name} Parameters
            </h3>
          </div>
          <div className="form-grid-3">
            {selectedStrategy.parameters.map((param) => renderDynamicField(param))}
          </div>
        </div>
      )}

      {/* Checklist */}
      {selectedStrategy && selectedStrategy.checklist?.length > 0 && (
        <ChecklistPanel
          checklist={selectedStrategy.checklist}
          values={checklistValues}
          onChange={setChecklistValues}
        />
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="form-section card">
          <h3 className="section-title">Screenshots</h3>
          <div className="screenshots-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {screenshots.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt={`Screenshot ${i + 1}`} style={{ height: '120px', borderRadius: '8px', border: '1px solid var(--color-border)', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setScreenshots((prev) => prev.filter((_, index) => index !== i))}
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff',
                    border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer',
                    fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Notes */}
      <div className="form-section card">
        <h3 className="section-title">Journal Notes</h3>
        <div className="notes-grid">
          <div className="field">
            <label className="field-label">Trade Idea</label>
            <textarea id="input-idea" placeholder="What was your trade idea or thesis?" value={idea} onChange={(e) => setIdea(e.target.value)} className="form-textarea" rows={3} />
          </div>
          <div className="field">
            <label className="field-label">Mistakes</label>
            <textarea id="input-mistakes" placeholder="What did you do wrong?" value={mistakes} onChange={(e) => setMistakes(e.target.value)} className="form-textarea" rows={3} />
          </div>
          <div className="field">
            <label className="field-label">Lessons Learned</label>
            <textarea id="input-lessons" placeholder="What will you do differently?" value={lessons} onChange={(e) => setLessons(e.target.value)} className="form-textarea" rows={3} />
          </div>
          <div className="field">
            <label className="field-label">Emotion</label>
            <div className="emotion-grid">
              {EMOTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`emotion-btn ${emotion === em ? 'active' : ''}`}
                  onClick={() => setEmotion(emotion === em ? '' : em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="form-footer">
        <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancel</button>
        <button id="btn-save-trade" type="submit" className="btn-save" disabled={isPending}>
          {isPending ? <span className="spinner" /> : trade ? 'Update Trade' : 'Log Trade'}
        </button>
      </div>

      <style jsx>{`
        .trade-form { display: flex; flex-direction: column; gap: 20px; max-width: 900px; }
        .form-section { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .section-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .strategy-label { display: flex; align-items: center; gap: 8px; }
        .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 700px) { .form-grid-3 { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--color-placeholder); }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--color-accent); }
        .form-textarea { resize: vertical; min-height: 80px; }
        .direction-group { display: flex; gap: 6px; }
        .dir-btn {
          flex: 1; padding: 8px 12px;
          background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 4px; color: var(--color-muted-foreground);
          font-size: 0.8125rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s; font-family: inherit;
        }
        .dir-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-subtle); }
        .dir-btn.long.active { border-color: var(--color-success); color: var(--color-success); background: var(--color-success-muted); }
        .dir-btn.short.active { border-color: var(--color-loss); color: var(--color-loss); background: var(--color-loss-muted); }
        .dir-btn.open.active { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-subtle); }
        .bool-group, .multi-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .bool-btn, .multi-btn {
          padding: 6px 14px;
          background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 4px; color: var(--color-muted-foreground);
          font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .bool-btn.active, .multi-btn.active {
          border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-subtle);
        }
        .rating-group { display: flex; gap: 6px; }
        .rating-btn {
          width: 36px; height: 36px;
          background: var(--color-background); border: 1px solid var(--color-border);
          border-radius: 4px; color: var(--color-muted-foreground);
          font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .rating-btn.active { border-color: var(--color-warning); color: var(--color-warning); background: var(--color-warning-muted); }
        .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .notes-grid { grid-template-columns: 1fr; } }
        .emotion-grid { display: flex; gap: 6px; flex-wrap: wrap; }
        .emotion-btn {
          padding: 6px 12px; border-radius: 4px; font-size: 0.8125rem; cursor: pointer; transition: all 0.15s;
          background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-muted-foreground); font-family: inherit;
        }
        .emotion-btn.active { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-subtle); }
        .form-footer { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-cancel {
          padding: 9px 18px; background: none; border: 1px solid var(--color-border); border-radius: 4px;
          color: var(--color-muted-foreground); font-size: 0.875rem; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .btn-cancel:hover { border-color: var(--color-accent); color: var(--color-foreground); }
        .btn-save {
          padding: 9px 20px; background: var(--color-accent); border: none; border-radius: 4px;
          color: white; font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s; display: flex; align-items: center; gap: 8px;
          min-width: 120px; justify-content: center; font-family: inherit;
        }
        .btn-save:hover { background: var(--color-accent-hover); }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai-paste-zone {
          padding: 20px;
          border: 2px dashed var(--color-border);
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.04);
          text-align: center;
          color: var(--color-muted-foreground);
          transition: all 0.2s;
        }
        .ai-paste-zone:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.08); }
        .ai-paste-zone.extracting { border-style: solid; border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .paste-content { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 0.875rem; }
        .paste-icon { font-size: 1.5rem; margin-bottom: 4px; }
        .ai-spinner { border-top-color: #3b82f6; border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; border-width: 3px; width: 24px; height: 24px; }
        .ai-paste-zone strong { color: var(--color-foreground); font-weight: 600; }
      `}</style>
    </form>
  );
}
