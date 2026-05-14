import { useRef, useEffect } from 'react';
import { suppliers } from '../data/suppliers';
import { useAppStore } from '../store';

export default function SupplierTabs() {
  const { activeSupplier, setActiveSupplier, draftOrders } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date().getDay();

  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-active="true"]`) as HTMLElement;
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSupplier]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', WebkitOverflowScrolling: 'touch' }}
    >
      {suppliers.map(s => {
        const isActive = s.id === activeSupplier;
        const isToday = s.schedule.writeDays.includes(today);
        const hasDraft = (draftOrders[s.id] ?? []).some(i => i.quantity > 0);

        return (
          <button
            key={s.id}
            data-active={isActive}
            onClick={() => setActiveSupplier(s.id)}
            className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl shrink-0 transition-all duration-150 active:scale-95"
            style={isActive ? {
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              border: '1px solid #f59e0b',
              color: '#1a1a1a',
              boxShadow: '0 0 16px rgba(245,158,11,0.3)',
            } : {
              background: 'var(--bg-card2)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className="text-xs font-medium whitespace-nowrap">{s.name}</span>

            {isToday && !isActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full"
                    style={{ border: '2px solid var(--bg-card)' }} />
            )}
            {hasDraft && (
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"
                    style={{ border: '2px solid var(--bg-card)' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
