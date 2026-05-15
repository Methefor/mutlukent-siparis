import { useState, useEffect } from 'react';
import { suppliers } from '../data/suppliers';
import { useAppStore } from '../store';
import { todayISO, formatDateTR } from '../lib/whatsapp';

export default function MissingItemsForm() {
  const { selectedBranch } = useAppStore();
  const branchId = selectedBranch?.id ?? '';
  const storageKey = `missing-${todayISO()}-${branchId}`;

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotes(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  function handleSave() {
    localStorage.setItem(storageKey, JSON.stringify(notes));
    setSaved(true);
  }

  const todayLabel = formatDateTR();

  return (
    <div
      style={{
        maxWidth: '42rem',
        margin: '0 auto',
        padding: '0.75rem 1rem 6rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Success banner */}
      {saved && (
        <div
          style={{
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid #22c55e',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: '0.85rem',
            color: '#22c55e',
            fontWeight: 600,
          }}
        >
          ✅ Eksik form kaydedildi — {todayLabel}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
          {selectedBranch?.emoji} {selectedBranch?.name}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          {todayLabel}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
          Eksik, biten veya sipariş notu eklemek istediğin ürünleri yaz
        </p>
      </div>

      {/* Supplier cards */}
      {suppliers.map((s) => (
        <div
          key={s.id}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '12px 16px',
          }}
        >
          <p
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#f59e0b',
              margin: '0 0 8px',
            }}
          >
            {s.emoji} {s.name}
          </p>
          <textarea
            rows={3}
            placeholder="Bu firma için eksik veya not ekle..."
            value={notes[s.id] ?? ''}
            onChange={(e) => {
              setSaved(false);
              setNotes((prev) => ({ ...prev, [s.id]: e.target.value }));
            }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: '0.85rem',
              width: '100%',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
      ))}

      {/* Save button */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 14,
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
          color: '#1a1a1a',
          fontSize: '0.95rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        💾 Formu Kaydet
      </button>
    </div>
  );
}
