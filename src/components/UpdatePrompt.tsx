import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // check for updates every 60 min
      if (r) setInterval(() => r.update(), 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl"
      style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.5)', maxWidth: 480, margin: '0 auto' }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          🔄 Yeni güncelleme mevcut
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Uygulamayı güncellemek için dokunun
        </p>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95 amber-glow"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}
      >
        Güncelle
      </button>
    </div>
  );
}
