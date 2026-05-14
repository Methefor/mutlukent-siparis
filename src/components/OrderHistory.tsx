import { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAppStore } from '../store';
import { supplierMap } from '../data/suppliers';
import type { Order, OrderItem } from '../types';

interface Props {
  supplierId: string;
  onClose: () => void;
  onLoad: (items: OrderItem[]) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS = {
  confirmed: { label: '✅ Onaylandı', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  sent: { label: '📱 Gönderildi', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  draft: { label: '📝 Taslak', bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

export default function OrderHistory({ supplierId, onClose, onLoad }: Props) {
  const { selectedBranch } = useAppStore();
  const { fetchOrders, loading } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const supplier = supplierMap[supplierId];

  useEffect(() => {
    fetchOrders({ supplierId, branchId: selectedBranch?.id, limit: 10 }).then(setOrders);
  }, [supplierId, selectedBranch?.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.75)' }}
         onClick={onClose}>
      <div className="w-full max-w-lg max-h-[80vh] flex flex-col rounded-t-2xl glass"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            📋 {supplier.emoji} {supplier.name} — Geçmiş
          </h3>
          <button onClick={onClose} className="text-2xl w-8 h-8 flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loading && <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>}
          {!loading && orders.length === 0 && (
            <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Henüz geçmiş sipariş yok.</p>
          )}
          {orders.map(order => {
            const st = STATUS[order.status];
            return (
              <button key={order.id} onClick={() => onLoad(order.items)}
                      className="w-full text-left rounded-xl p-3.5 transition"
                      style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.items.map(item => (
                    <span key={item.productId} className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {item.emoji} {item.quantity} {item.unit}
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: '#f59e0b' }}>Yüklemek için tıkla →</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
