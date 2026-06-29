'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { importTradesAction } from '@/actions/import.actions';
import type { TradingAccount } from '@/types/ai.types';
import { Upload, FileText, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import Papa from 'papaparse';

const PLATFORM_HELP = {
  MT5: 'Go to History → Right-click → Save as Report → CSV',
  MT4: 'Account History → Right-click → Save as Detailed Statement → HTML then convert, or use Terminal CSV',
  MatchTrader: 'Reports → Trade History → Export CSV',
  cTrader: 'History → Export',
};

interface ParsedRow {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  pnl?: number;
  tradeDate: string;
  status: 'closed' | 'open';
}

interface ImportClientProps {
  accounts: TradingAccount[];
}

function parseMT5Row(row: Record<string, string>): ParsedRow | null {
  try {
    const type = (row['Type'] ?? row['type'] ?? '').toLowerCase();
    if (!type.includes('buy') && !type.includes('sell')) return null;

    const symbol = row['Symbol'] ?? row['symbol'] ?? '';
    if (!symbol) return null;

    return {
      symbol: symbol.toUpperCase(),
      direction: type.includes('buy') ? 'LONG' : 'SHORT',
      entryPrice: parseFloat(row['Price'] ?? row['Entry Price'] ?? row['Open Price'] ?? '0'),
      exitPrice: parseFloat(row['Close Price'] ?? row['Exit Price'] ?? '0') || undefined,
      lotSize: parseFloat(row['Volume'] ?? row['Lots'] ?? row['Size'] ?? '1'),
      pnl: parseFloat(row['Profit'] ?? row['P/L'] ?? row['Net Profit'] ?? '0'),
      tradeDate: row['Time'] ?? row['Open Time'] ?? row['Date'] ?? new Date().toISOString(),
      status: 'closed',
    };
  } catch {
    return null;
  }
}

export function ImportClient({ accounts }: ImportClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?._id ?? '');
  const [platform, setPlatform] = useState<keyof typeof PLATFORM_HELP>('MT5');
  const [parsedTrades, setParsedTrades] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imported, setImported] = useState<{ imported: number; skipped: number } | null>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    setParsedTrades([]);
    setImported(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const parsed = rows.map(parseMT5Row).filter((r): r is ParsedRow => r !== null);
        setParsedTrades(parsed);
        if (parsed.length === 0) {
          toast.error('No valid trades found in file. Check the format matches the selected platform.');
        } else {
          toast.success(`Found ${parsed.length} trades ready to import`);
        }
      },
      error: () => toast.error('Failed to parse CSV file'),
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    } else {
      toast.error('Please drop a CSV file');
    }
  }

  function handleImport() {
    if (!selectedAccount || parsedTrades.length === 0) return;
    startTransition(async () => {
      const result = await importTradesAction(selectedAccount, parsedTrades);
      if (result.error) {
        toast.error(result.error);
      } else {
        setImported(result);
        setParsedTrades([]);
        setFileName('');
        toast.success(`Imported ${result.imported} trades!`);
        router.refresh();
      }
    });
  }

  return (
    <div className="import-layout">
      {/* Config */}
      <div className="config-row">
        <div className="card config-card">
          <h3 className="section-title">Import Settings</h3>
          <div className="form-row">
            <div className="field">
              <label className="field-label">Account</label>
              <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="form-select" id="select-import-account">
                {accounts.map((a) => <option key={a._id} value={a._id}>{a.accountName}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Platform</label>
              <div className="platform-grid">
                {(Object.keys(PLATFORM_HELP) as (keyof typeof PLATFORM_HELP)[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`platform-btn ${platform === p ? 'active' : ''}`}
                    onClick={() => setPlatform(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="help-hint">
            <Info size={13} color="#3b82f6" />
            <span>{PLATFORM_HELP[platform]}</span>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone card ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="drop-icon">
          <Upload size={24} color="#3b82f6" />
        </div>
        <div className="drop-text">
          <span>Drag & drop your CSV file here, or</span>
          <label className="file-label" htmlFor="csv-input">browse files</label>
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
        {fileName && (
          <div className="file-name">
            <FileText size={14} color="var(--color-muted-foreground)" />
            <span>{fileName}</span>
          </div>
        )}
      </div>

      {/* Preview */}
      {parsedTrades.length > 0 && (
        <div className="card preview-card animate-fade-in">
          <div className="preview-header">
            <h3 className="section-title">Preview ({parsedTrades.length} trades)</h3>
            <button
              id="btn-import-trades"
              className="btn-import"
              onClick={handleImport}
              disabled={isPending}
            >
              {isPending ? <><span className="spinner" /> Importing...</> : <><Upload size={14} /> Import All</>}
            </button>
          </div>
          <div className="preview-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Lots</th>
                  <th>PnL</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {parsedTrades.slice(0, 20).map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t.symbol}</td>
                    <td>
                      <span className={`badge ${t.direction === 'LONG' ? 'badge-success' : 'badge-loss'}`}>
                        {t.direction}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-muted-foreground)' }}>{t.entryPrice}</td>
                    <td style={{ color: 'var(--color-muted-foreground)' }}>{t.exitPrice ?? '—'}</td>
                    <td style={{ color: 'var(--color-muted-foreground)' }}>{t.lotSize}</td>
                    <td style={{ color: (t.pnl ?? 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {t.pnl !== undefined ? `$${t.pnl.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ color: '#71717a', fontSize: '0.8125rem' }}>{t.tradeDate.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedTrades.length > 20 && (
              <div className="preview-more">+{parsedTrades.length - 20} more trades</div>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {imported && (
        <div className="success-card card animate-fade-in">
          <CheckCircle2 size={24} color="#22c55e" />
          <div>
            <h3 className="success-title">Import Complete</h3>
            <p className="success-desc">
              Successfully imported <strong style={{ color: '#22c55e' }}>{imported.imported} trades</strong>.
              {imported.skipped > 0 && ` ${imported.skipped} skipped (duplicates or invalid).`}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .import-layout { display: flex; flex-direction: column; gap: 20px; max-width: 800px; }
        .config-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .config-row {}
        .section-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.8125rem; font-weight: 500; color: var(--color-muted-foreground); }
        .form-select { padding: 8px 12px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-foreground); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.15s; width: 100%; }
        .platform-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .platform-btn { padding: 6px 8px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 6px; color: #71717a; font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .platform-btn.active { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.06); }
        .help-hint { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.12); border-radius: 8px; font-size: 0.8125rem; color: var(--color-muted-foreground); }
        .drop-zone {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 40px; border-style: dashed !important; cursor: pointer;
          transition: all 0.15s;
        }
        .drop-zone.dragging { border-color: #3b82f6 !important; background: rgba(59,130,246,0.04); }
        .drop-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15); display: flex; align-items: center; justify-content: center; }
        .drop-text { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--color-muted-foreground); }
        .file-label { color: #3b82f6; cursor: pointer; font-weight: 500; }
        .file-label:hover { text-decoration: underline; }
        .file-name { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--color-muted-foreground); }
        .preview-card { padding: 0; overflow: hidden; }
        .preview-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--color-border-subtle); }
        .preview-table { overflow-x: auto; }
        .preview-more { padding: 10px 20px; font-size: 0.8125rem; color: var(--color-placeholder); border-top: 1px solid var(--color-border-subtle); }
        .btn-import { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: #3b82f6; border: none; border-radius: 8px; color: white; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.15s; font-family: inherit; }
        .btn-import:hover { background: #2563eb; }
        .btn-import:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .success-card { padding: 20px; display: flex; align-items: flex-start; gap: 16px; border-color: rgba(34,197,94,0.2) !important; background: rgba(34,197,94,0.04) !important; }
        .success-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-foreground); margin: 0 0 4px; }
        .success-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
