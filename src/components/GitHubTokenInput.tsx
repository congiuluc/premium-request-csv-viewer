import { useState, useEffect, useCallback } from 'react';
import { KeyRound, X, Trash2, Save } from 'lucide-react';
import { getToken, setToken, checkRateLimit } from '../utils/githubApi';
import type { RateLimitInfo } from '../types';

interface Props {
  onResolve: () => Promise<void>;
  loading: boolean;
}

export default function GitHubTokenInput({ onResolve, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(getToken() || '');
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  const fetchRate = useCallback(async () => {
    const info = await checkRateLimit(getToken() || '');
    setRateLimit(info);
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const handleSave = async () => {
    setToken(value);
    await fetchRate();
    if (onResolve) await onResolve();
    setOpen(false);
  };

  const handleClear = () => {
    setValue('');
    setToken('');
    setRateLimit(null);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-secondary text-xs gap-1.5"
      >
        <span className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-500 animate-pulse-soft' : 'bg-muted-foreground'}`} />
        <KeyRound className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Token</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4
                 animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="card p-6 w-full max-w-md shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold">GitHub Token</h3>
          </div>
          <button onClick={() => setOpen(false)} className="btn btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Provides higher API rate limits (5,000/hr vs 60/hr) for resolving usernames.
          Token is stored locally and only sent to api.github.com.
        </p>

        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ghp_..."
          className="input w-full mb-3"
        />

        {rateLimit && (
          <div className="flex gap-3 text-xs text-muted-foreground mb-4 p-2.5 rounded-lg bg-secondary">
            <span>Limit: <strong className="text-foreground">{rateLimit.limit}</strong></span>
            <span>Remaining: <strong className="text-foreground">{rateLimit.remaining}</strong></span>
            <span>Resets: <strong className="text-foreground">{rateLimit.resetAt.toLocaleTimeString()}</strong></span>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <button onClick={handleClear} className="btn btn-ghost text-xs gap-1">
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
          <button onClick={() => setOpen(false)} className="btn btn-secondary text-xs">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary text-xs gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Resolving...' : 'Save & Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
}

