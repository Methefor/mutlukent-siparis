import { useState } from 'react';
import { useAppStore } from '../store';
import { useOrders } from '../hooks/useOrders';
import { supplierMap } from '../data/suppliers';
import { generateMessage, sendToWhatsApp, todayISO } from '../lib/whatsapp';
import type { OrderItem, FavoriteOrder, Product } from '../types';
import OrderHistory from './OrderHistory';
import QuickQtyInput from './QuickQtyInput';

interface Props { supplierId: string; }

type ProductGroup = { noSub: Product[]; subs: Record<string, Product[]> };

export default function OrderForm({ supplierId }: Props) {
  const supplier = supplierMap[supplierId];
  const { selectedBranch, draftOrders, updateDraft, clearDraft, saveLastOrder, loadLastOrder, favorites, addFavorite, removeFavorite, loadFavorite } = useAppStore();
  const { saveOrder } = useOrders();
  const [showHistory, setShowHistory] = useState(false);
  const [showFavName, setShowFavName] = useState(false);
  const [favName, setFavName] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);

  const items: OrderItem[] = draftOrders[supplierId] ?? [];
  const getQty = (id: string) => items.find(i => i.productId === id)?.quantity ?? 0;

  const setQty = (productId: string, qty: number) => {
    const product = supplier.products.find(p => p.id === productId)!;
    if (qty <= 0) {
      updateDraft(supplierId, items.filter(i => i.productId !== productId));
    } else {
      const existing = items.find(i => i.productId === productId);
      if (existing) {
        updateDraft(supplierId, items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
      } else {
        updateDraft(supplierId, [...items, { productId, productName: product.name, quantity: qty, unit: product.unit, emoji: product.emoji }]);
      }
    }
  };

  const activeItems = items.filter(i => i.quantity > 0);

  function showToast(msg: string, type: 'success' | 'warn' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSave() {
    if (!selectedBranch) { showToast('Önce şube seçin!', 'warn'); return; }
    if (!activeItems.length) { showToast('En az bir ürün girin!', 'warn'); return; }
    saveLastOrder(supplierId, activeItems);
    await saveOrder({ branchId: selectedBranch.id, branchName: selectedBranch.name, supplierId, supplierName: supplier.name, items: activeItems, status: 'draft', date: todayISO() });
    showToast('Sipariş kaydedildi ✅');
  }

  function handleWhatsApp() {
    if (!selectedBranch) { showToast('Önce şube seçin!', 'warn'); return; }
    if (!activeItems.length) { showToast('En az bir ürün girin!', 'warn'); return; }
    saveLastOrder(supplierId, activeItems);
    sendToWhatsApp(generateMessage(selectedBranch, supplier, activeItems), supplier.phone);
  }

  function handleSaveFavorite() {
    if (!favName.trim() || !activeItems.length) { setShowFavName(false); return; }
    const fav: FavoriteOrder = { id: Date.now().toString(), name: favName.trim(), supplierId, items: activeItems, createdAt: new Date().toISOString() };
    addFavorite(fav);
    setFavName(''); setShowFavName(false);
    showToast('Favoriye eklendi ⭐');
  }

  const supplierFavs = favorites.filter(f => f.supplierId === supplierId);

  // Group products by category → subcategory
  const categories = supplier.products.reduce<Record<string, ProductGroup>>((acc, p) => {
    const cat = p.category ?? '';
    const sub = p.subcategory ?? '';
    if (!acc[cat]) acc[cat] = { noSub: [], subs: {} };
    if (sub) {
      if (!acc[cat].subs[sub]) acc[cat].subs[sub] = [];
      acc[cat].subs[sub].push(p);
    } else {
      acc[cat].noSub.push(p);
    }
    return acc;
  }, {});

  function renderProduct(product: Product) {
    const qty = getQty(product.id);
    return (
      <div key={product.id}
           className="rounded-xl px-3 pt-2.5 pb-2 transition-all"
           style={qty > 0 ? {
             background: 'rgba(245,158,11,0.08)',
             border: '1px solid rgba(245,158,11,0.3)',
           } : {
             background: 'var(--bg-card2)',
             border: '1px solid var(--border)',
           }}>
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">{product.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight"
               style={{ color: qty > 0 ? '#fbbf24' : 'var(--text-secondary)' }}>
              {product.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.unit}</p>
          </div>
          {qty > 0 && (
            <span className="text-base font-bold shrink-0" style={{ color: '#f59e0b' }}>
              {qty}
            </span>
          )}
        </div>
        <QuickQtyInput
          qty={qty}
          step={product.step}
          presets={product.presets}
          onSet={(q) => setQty(product.id, q)}
        />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Supplier Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {supplier.emoji} {supplier.name}
          </h2>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              {supplier.schedule.writeLabel}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
              {supplier.schedule.deliveryLabel}
            </span>
          </div>
        </div>
        {activeItems.length > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}>
            {activeItems.length} ürün
          </span>
        )}
      </div>

      {/* Favorites */}
      {supplierFavs.length > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-xl"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#f59e0b' }}>⭐ Favoriler</p>
          <div className="flex flex-wrap gap-2">
            {supplierFavs.map(fav => (
              <div key={fav.id} className="flex items-center rounded-lg overflow-hidden"
                   style={{ background: 'var(--bg-card2)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <button onClick={() => { loadFavorite(fav.id); showToast(`"${fav.name}" yüklendi`); }}
                        className="text-xs font-medium px-2.5 py-1.5"
                        style={{ color: '#fbbf24' }}>
                  {fav.name}
                </button>
                <button onClick={() => removeFavorite(fav.id)}
                        className="pr-2 text-sm"
                        style={{ color: 'var(--text-muted)' }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="px-4 space-y-4">
        {Object.entries(categories).map(([category, group]) => (
          <div key={category || '_'}>
            {category && (
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                {supplier.categoryEmojis?.[category] && `${supplier.categoryEmojis[category]} `}{category}
              </h3>
            )}
            <div className="space-y-2">
              {group.noSub.map(renderProduct)}
            </div>
            {Object.entries(group.subs).map(([sub, subProducts]) => (
              <div key={sub} className="mt-3">
                <h4 className="text-xs font-semibold mb-2 pl-1"
                    style={{ color: 'rgba(245,158,11,0.7)' }}>
                  ↳ {sub}
                </h4>
                <div className="space-y-2">
                  {subProducts.map(renderProduct)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 mt-5 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '📥 Son Siparişi Yükle', action: () => { if (!loadLastOrder(supplierId)) showToast('Kaydedilmiş sipariş yok', 'warn'); else showToast('Son sipariş yüklendi'); } },
            { label: '📋 Geçmiş', action: () => setShowHistory(true) },
            { label: '⭐ Favoriye Ekle', action: () => setShowFavName(true), amber: true },
            { label: '🗑️ Temizle', action: () => { clearDraft(supplierId); showToast('Temizlendi', 'warn'); }, danger: true },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="py-2.5 rounded-xl text-sm font-medium active:scale-95 transition"
              style={btn.amber ? {
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.35)',
                color: '#f59e0b',
              } : btn.danger ? {
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
              } : {
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl font-semibold text-base active:scale-95 transition"
          style={{ background: 'var(--bg-card2)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-primary)' }}
        >
          💾 Siparişi Kaydet
        </button>

        <button
          onClick={handleWhatsApp}
          className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition amber-glow"
          style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', color: 'white' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.537 5.877L0 24l6.293-1.517A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-5.012-1.377l-.36-.213-3.733.9.952-3.641-.235-.374A9.762 9.762 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          WhatsApp'a Gönder
        </button>
      </div>

      {/* WhatsApp Preview */}
      {activeItems.length > 0 && selectedBranch && (
        <div className="mx-4 mt-4 p-4 rounded-xl"
             style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#4ade80' }}>📱 Mesaj Önizleme</p>
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed"
               style={{ color: 'var(--text-secondary)' }}>
            {generateMessage(selectedBranch, supplier, activeItems)}
          </pre>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50"
             style={toast.type === 'success' ? {
               background: 'var(--bg-card)',
               border: '1px solid rgba(245,158,11,0.4)',
               color: 'var(--text-primary)',
             } : {
               background: 'rgba(245,158,11,0.9)',
               color: '#1a1a1a',
             }}>
          {toast.msg}
        </div>
      )}

      {/* Favorite Name Modal */}
      {showFavName && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg p-5 rounded-t-2xl glass">
            <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>⭐ Favoriye Kaydet</h3>
            <input
              type="text"
              value={favName}
              onChange={e => setFavName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveFavorite()}
              placeholder="Favori ismi (ör: Haftalık Standart)"
              className="w-full rounded-xl px-4 py-2.5 text-sm mb-3 outline-none"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowFavName(false); setFavName(''); }}
                      className="flex-1 py-2.5 rounded-xl text-sm"
                      style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                İptal
              </button>
              <button onClick={handleSaveFavorite}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold amber-glow"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#1a1a1a' }}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <OrderHistory
          supplierId={supplierId}
          onClose={() => setShowHistory(false)}
          onLoad={(loadedItems) => { updateDraft(supplierId, loadedItems); setShowHistory(false); showToast('Sipariş yüklendi'); }}
        />
      )}
    </div>
  );
}
