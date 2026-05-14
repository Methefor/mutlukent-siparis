import type { Branch, Supplier, OrderItem } from '../types';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function formatDateTR(date: Date = new Date()): string {
  return `${date.getDate()} ${MONTHS_TR[date.getMonth()]} ${date.getFullYear()}, ${DAYS_TR[date.getDay()]}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateMessage(branch: Branch, supplier: Supplier, items: OrderItem[]): string {
  const date = formatDateTR();
  let msg = `*${supplier.name}*\n`;
  msg += `📅 ${date}\n`;
  msg += `📍 ${branch.name}\n\n`;

  const hasCategories = supplier.products.some(p => p.category);

  if (!hasCategories) {
    items.forEach(item => {
      msg += `• ${item.emoji} ${item.productName}: *${item.quantity} ${item.unit}*\n`;
    });
    return msg.trim();
  }

  // Build ordered category → subcategory → items map preserving supplier product order
  const catOrder: string[] = [];
  const subOrder: Record<string, string[]> = {};
  for (const p of supplier.products) {
    const cat = p.category ?? '';
    const sub = p.subcategory ?? '';
    if (!catOrder.includes(cat)) { catOrder.push(cat); subOrder[cat] = []; }
    if (sub && !subOrder[cat].includes(sub)) subOrder[cat].push(sub);
  }

  const grouped = new Map<string, Map<string, OrderItem[]>>();
  for (const item of items) {
    const product = supplier.products.find(p => p.id === item.productId);
    const cat = product?.category ?? '';
    const sub = product?.subcategory ?? '';
    if (!grouped.has(cat)) grouped.set(cat, new Map());
    const catMap = grouped.get(cat)!;
    if (!catMap.has(sub)) catMap.set(sub, []);
    catMap.get(sub)!.push(item);
  }

  for (const cat of catOrder) {
    const catMap = grouped.get(cat);
    if (!catMap) continue;
    if (cat) msg += `*${cat}*\n`;
    const noSub = catMap.get('');
    if (noSub) {
      noSub.forEach(item => {
        msg += `• ${item.emoji} ${item.productName}: *${item.quantity} ${item.unit}*\n`;
      });
    }
    for (const sub of subOrder[cat]) {
      const subItems = catMap.get(sub);
      if (!subItems) continue;
      msg += `  _${sub}_\n`;
      subItems.forEach(item => {
        msg += `  • ${item.emoji} ${item.productName}: *${item.quantity} ${item.unit}*\n`;
      });
    }
    msg += '\n';
  }

  return msg.trim();
}

export function sendToWhatsApp(message: string, phone?: string): void {
  const encoded = encodeURIComponent(message);
  const url = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  const win = window.open(url, '_blank');
  if (!win) {
    navigator.clipboard?.writeText(message)
      .then(() => alert('Mesaj panoya kopyalandı! WhatsApp\'a yapıştırın.'))
      .catch(() => alert(`WhatsApp mesajı:\n\n${message}`));
  }
}
