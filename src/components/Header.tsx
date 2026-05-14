import { useState } from 'react';
import { useAppStore } from '../store';
import { formatDateTR } from '../lib/whatsapp';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

export default function Header() {
  const { selectedBranch, setBranch, isAdmin, setAdmin } = useAppStore();
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  function handleAdminLogin() {
    if (pin === ADMIN_PIN) {
      setAdmin(true);
      setShowAdminPrompt(false);
      setPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  }

  return (
    <>
      <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
              className="shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">📦</span>
              <div className="min-w-0">
                <h1 className="text-base font-bold leading-tight text-amber-gradient">
                  Mutlukent Sipariş
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTR()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedBranch && (
                <button
                  onClick={() => setBranch(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <span>{selectedBranch.emoji}</span>
                  <span className="max-w-[80px] truncate">{selectedBranch.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>↩</span>
                </button>
              )}

              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminPrompt(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  🔐 Admin
                </button>
              ) : (
                <button
                  onClick={() => setAdmin(false)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg amber-glow"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}
                >
                  ⭐ Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAdminPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <h3 className="text-lg font-bold mb-1 text-center" style={{ color: 'var(--text-primary)' }}>
              🔐 Admin Girişi
            </h3>
            <p className="text-center text-xs mb-4" style={{ color: 'var(--text-muted)' }}>PIN kodunuzu girin</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder="• • • •"
              className={`w-full rounded-xl px-4 py-3 text-center text-2xl tracking-widest mb-3 outline-none transition ${pinError ? 'ring-2 ring-red-500' : ''}`}
              style={{
                background: 'var(--bg-card2)',
                border: `2px solid ${pinError ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
            {pinError && <p className="text-red-400 text-sm text-center mb-3">❌ Yanlış PIN</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdminPrompt(false); setPin(''); setPinError(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                İptal
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition amber-glow"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}
              >
                Giriş
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
