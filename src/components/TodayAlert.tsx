import { useState, useEffect } from 'react';
import { suppliers } from '../data/suppliers';
import { useAppStore } from '../store';

type DeadlineStatus = 'ok' | 'soon' | 'passed';

function deadlineStatus(deadline: string, now: Date): DeadlineStatus {
  const [h, m] = deadline.split(':').map(Number);
  const dl = new Date(now);
  dl.setHours(h, m, 0, 0);
  const diff = dl.getTime() - now.getTime();
  if (diff < 0) return 'passed';
  if (diff < 60 * 60 * 1000) return 'soon';
  return 'ok';
}

const dlStyle: Record<DeadlineStatus, { bg: string; color: string; border: string }> = {
  ok:     { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  soon:   { bg: 'rgba(245,158,11,0.18)', color: '#fbbf24', border: 'rgba(245,158,11,0.5)' },
  passed: { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

export default function TodayAlert() {
  const setActiveSupplier = useAppStore(s => s.setActiveSupplier);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const today = now.getDay();
  const todaySuppliers = suppliers.filter(s => s.schedule.writeDays.includes(today));

  if (!todaySuppliers.length) return null;

  // Separate suppliers by type
  const firmSuppliers = todaySuppliers.filter(s => s.deadline);
  const depoSuppliers = todaySuppliers.filter(s => !s.deadline);

  return (
    <div className="mx-4 mt-3 space-y-2">
      {/* Firm orders */}
      {firmSuppliers.length > 0 && (
        <div className="rounded-xl px-4 py-3"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>
            📢 Bugün firma siparişi verilecekler
          </p>
          <div className="flex flex-wrap gap-2">
            {firmSuppliers.map(s => {
              const status = deadlineStatus(s.deadline!, now);
              const st = dlStyle[status];
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSupplier(s.id)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 active:scale-95 transition-transform"
                  style={{ background: status === 'passed' ? 'rgba(239,68,68,0.08)' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: status === 'passed' ? '#f87171' : '#1a1a1a', border: status === 'passed' ? '1px solid rgba(239,68,68,0.3)' : 'none', opacity: status === 'passed' ? 0.7 : 1 }}
                >
                  <span className="text-sm font-bold">{s.emoji} {s.name}</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                  >
                    {status === 'passed' ? '✕ Süre doldu' : `⏰ ${s.deadline}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Depo */}
      {depoSuppliers.length > 0 && (
        <div className="rounded-xl px-4 py-3"
             style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.15)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            📦 Depo siparişi — saat fark etmez
          </p>
          <div className="flex flex-wrap gap-2">
            {depoSuppliers.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSupplier(s.id)}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {s.emoji} {s.name}
                <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                  ⏰ Tost 15:00
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
