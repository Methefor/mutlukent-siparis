import { useState, useEffect, useCallback } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAppStore } from '../store';
import { suppliers } from '../data/suppliers';
import { branches } from '../data/branches';
import { isFirebaseConfigured } from '../lib/firebase';
import { todayISO, generateMessage } from '../lib/whatsapp';
import { sendToWhatsApp } from '../lib/whatsapp';
import { supplierMap } from '../data/suppliers';
import type { Order } from '../types';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS = {
  draft:     { label: 'Taslak',     bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
  sent:      { label: 'Gönderildi', bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  confirmed: { label: 'Onaylandı',  bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
};

const inputStyle = {
  background: 'var(--bg-card2)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
};

export default function AdminDashboard() {
  const { setAdmin } = useAppStore();
  const { fetchOrders, updateStatus, loading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterDate, setFilterDate] = useState(todayISO());
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await fetchOrders({
      date: filterDate || undefined,
      branchId: filterBranch || undefined,
      supplierId: filterSupplier || undefined,
      limit: 100,
    });
    setOrders(result);
  }, [filterDate, filterBranch, filterSupplier, fetchOrders]);

  useEffect(() => { load(); }, [load]);

  async function handleStatus(orderId: string, status: Order['status']) {
    await updateStatus(orderId!, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'draft').length,
    sent:      orders.filter(o => o.status === 'sent').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Orbs */}
      <div className="orb orb-amber" />
      <div className="orb orb-blue" />

      {/* Header */}
      <div className="relative z-10"
           style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-amber-gradient">⭐ Admin Paneli</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mutlukent Sipariş Yönetimi</p>
          </div>
          <button
            onClick={() => setAdmin(false)}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition"
            style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            ← Çıkış
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Toplam',    value: stats.total,     color: '#f1f5f9' },
            { label: 'Taslak',    value: stats.pending,   color: '#94a3b8' },
            { label: 'Gönderildi', value: stats.sent,     color: '#60a5fa' },
            { label: 'Onaylandı', value: stats.confirmed, color: '#4ade80' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-3 text-center"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Firebase badge */}
        <div className="text-xs px-3 py-1.5 rounded-lg mb-3 inline-block"
             style={isFirebaseConfigured
               ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
               : { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
          {isFirebaseConfigured ? '🟢 Firebase — gerçek zamanlı' : '🟡 Lokal mod — cihaz hafızası'}
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 mb-4 space-y-3"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Filtreler
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={inputStyle} />
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} style={inputStyle}>
              <option value="">Tüm Şubeler</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
            </select>
            <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} style={inputStyle}>
              <option value="">Tüm Firmalar</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 amber-glow"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}
          >
            {loading ? 'Yükleniyor...' : '🔄 Yenile'}
          </button>
        </div>

        {/* Empty state */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-5xl mb-3">📭</p>
            <p>Bu filtreler için sipariş bulunamadı.</p>
          </div>
        )}

        {/* Orders */}
        <div className="space-y-2">
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            const sup = supplierMap[order.supplierId];
            const st = STATUS[order.status];

            return (
              <div key={order.id} className="rounded-xl overflow-hidden"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button
                  className="w-full text-left px-4 py-3 flex items-center gap-3"
                  onClick={() => setExpandedId(isExpanded ? null : (order.id ?? null))}
                >
                  <span className="text-2xl shrink-0">{sup?.emoji ?? '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.branchName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.supplierName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtTime(order.createdAt)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.items.length} ürün</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      {order.items.map(item => (
                        <div key={item.productId} className="text-xs px-2 py-1.5 rounded-lg"
                             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          <span className="mr-1">{item.emoji}</span>
                          <span>{item.productName}</span>
                          <span className="font-bold ml-1" style={{ color: 'var(--text-primary)' }}>{item.quantity} {item.unit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(['draft', 'sent', 'confirmed'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatus(order.id!, s)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                          style={order.status === s ? {
                            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: '#1a1a1a',
                            border: 'none',
                          } : {
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {STATUS[s].label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const branch = branches.find(b => b.id === order.branchId);
                          if (branch && sup) sendToWhatsApp(generateMessage(branch, sup, order.items), sup.phone);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#4ade80' }}
                      >
                        📱 WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
