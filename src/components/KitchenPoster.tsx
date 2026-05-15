import { useState, useEffect } from 'react';
import { suppliers } from '../data/suppliers';
import { formatDateTR } from '../lib/whatsapp';

const DAY_NAMES: Record<number, string> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  0: 'Pazar',
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function KitchenPoster() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const todayDow = now.getDay();

  return (
    <div
      style={{
        maxWidth: '42rem',
        margin: '0 auto',
        padding: '0.75rem 1rem 6rem 1rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
          📅 Haftalık Sipariş Takvimi
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          {formatDateTR(now)}
        </p>
      </div>

      {/* Day cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAY_ORDER.map((dow) => {
          const isToday = dow === todayDow;
          const daySuppliers = suppliers.filter((s) =>
            s.schedule.writeDays.includes(dow)
          );

          return (
            <div
              key={dow}
              style={{
                background: isToday ? 'rgba(245,158,11,0.07)' : 'var(--bg-card)',
                border: isToday ? '1.5px solid #f59e0b' : '1px solid var(--border)',
                borderRadius: 14,
                padding: '12px 16px',
                position: 'relative',
              }}
            >
              {isToday && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 14,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                    letterSpacing: '0.04em',
                  }}
                >
                  ▶ BUGÜN
                </span>
              )}
              <p
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                  margin: '0 0 8px',
                }}
              >
                {DAY_NAMES[dow]}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {daySuppliers.map((s) => {
                  const isAlgida = s.id === 'algida';
                  const isDepo = s.id === 'depo';

                  return (
                    <span
                      key={s.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        background: isDepo
                          ? 'var(--bg-card2)'
                          : isAlgida
                          ? 'rgba(245,158,11,0.12)'
                          : 'var(--bg-card2)',
                        border: isAlgida
                          ? '1px solid #f59e0b'
                          : '1px solid var(--border)',
                        color: isDepo ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.name}</span>
                      {s.deadline && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            color: isAlgida ? '#f59e0b' : 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {s.deadline}
                        </span>
                      )}
                      {isDepo && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          serbest
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 16,
          padding: '12px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        ⚠️ Altınbaşak her gün yazılır, 2 gün sonra gelir · Soğukkuyu Fırın taze günlük · Tost ekmeği (Depo) 15:00'a kadar · Algida 16:00'ya kadar
      </div>
    </div>
  );
}
