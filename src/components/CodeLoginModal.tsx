import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CodeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeLoginModal: React.FC<CodeLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCode } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your passcode');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await loginWithCode(code);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          setCode('');
          setSuccessMsg(null);
        }, 1000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div 
        className="w-full max-w-md bg-[var(--bg-card)] text-charcoal border border-[var(--border-color)] p-6 sm:p-8 rounded-sm shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)] mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl mb-1 font-normal">Login</h2>
            <p className="font-mono text-[8px] uppercase tracking-widest opacity-40">
              Author Access
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-charcoal/5 rounded-full transition-colors opacity-60 hover:opacity-100"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-[var(--bg-page)] border border-red-500/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px] leading-snug">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[var(--bg-page)] border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 rounded-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[10px] leading-snug">{successMsg}</span>
            </div>
          )}

          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest opacity-60 block mb-2 font-bold">
              Passcode
            </label>
            <input
              type="text"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-3 text-sm bg-[var(--bg-page)] text-charcoal border border-[var(--border-color)] focus:border-charcoal outline-none font-mono font-bold tracking-widest uppercase rounded-sm transition-colors"
            />
            <p className="font-mono text-[9px] uppercase tracking-wider opacity-40 mt-2">
              Single-use passcodes are issued by the administrator for validated typists.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-charcoal text-beige font-mono text-[10px] uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Verify & Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
