import { suppliers } from '../data/suppliers';
import { useAppStore } from '../store';

export default function TodayAlert() {
  const setActiveSupplier = useAppStore(s => s.setActiveSupplier);
  const today = new Date().getDay();

  const todaySuppliers = suppliers.filter(s => s.schedule.writeDays.includes(today));

  if (!todaySuppliers.length) return null;

  return (
    <div className="mx-4 mt-3 rounded-xl px-4 py-3"
         style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>
        📢 Bugün sipariş verilecek firmalar:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {todaySuppliers.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSupplier(s.id)}
            className="text-xs font-semibold px-3 py-1 rounded-full active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
