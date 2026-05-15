import { useAppStore } from '../store';

const TABS: { view: 'orders' | 'poster' | 'missing'; label: string; icon: string }[] = [
  { view: 'orders', label: 'Sipariş', icon: '📋' },
  { view: 'poster', label: 'Takvim', icon: '📅' },
  { view: 'missing', label: 'Eksik Form', icon: '✏️' },
];

export default function BottomNav() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {TABS.map(({ view, label, icon }) => {
        const isActive = activeView === view;
        return (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: isActive
                ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                : 'var(--bg-card2)',
              borderTop: isActive ? 'none' : '1px solid var(--border)',
              color: isActive ? '#1a1a1a' : 'var(--text-muted)',
              borderRadius: 0,
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
