const DEFAULT_PRESETS = [1, 5, 10, 25];

interface Props {
  qty: number;
  step?: number;
  presets?: number[];
  onSet: (qty: number) => void;
}

export default function QuickQtyInput({ qty, step = 1, presets = DEFAULT_PRESETS, onSet }: Props) {
  const inc = () => onSet(Math.round((qty + step) * 100) / 100);
  const dec = () => onSet(Math.max(0, Math.round((qty - step) * 100) / 100));

  return (
    <div className="flex items-center gap-1 mt-2">
      {presets.map(p => (
        <button
          key={p}
          onClick={() => onSet(Math.round((qty + p) * 100) / 100)}
          className="flex-1 h-10 rounded-xl text-sm font-bold transition active:scale-95"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          +{p}
        </button>
      ))}
      <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />
      <button
        onClick={dec}
        disabled={qty === 0}
        className="w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center active:scale-90 transition disabled:opacity-30"
        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}
      >−</button>
      <span
        className="w-10 text-center font-bold tabular-nums text-sm"
        style={{ color: qty > 0 ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }}
      >
        {qty > 0 ? qty : '·'}
      </span>
      <button
        onClick={inc}
        className="w-10 h-10 rounded-xl font-bold text-lg flex items-center justify-center active:scale-90 transition amber-glow"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a', flexShrink: 0 }}
      >+</button>
    </div>
  );
}
