import type { Branch, Supplier, OrderItem } from '../types';

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function formatDateTR(date: Date = new Date()): string {
  return `${date.getDate()} ${MONTHS_TR[date.getMonth()]} ${date.getFullYear()}, ${DAYS_TR[date.getDay()]}`;
}

export function formatDateShort(date: Date = new Date()): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}.${m}.${date.getFullYear()}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateMessage(branch: Branch, supplier: Supplier, items: OrderItem[]): string {
  let msg = `${branch.emoji} ${branch.name}\n`;
  msg += `${formatDateShort()}\n`;
  msg += `${supplier.name.toUpperCase()}\n`;

  // Preserve supplier product order
  const ordered = supplier.products
    .map(p => items.find(i => i.productId === p.id))
    .filter(Boolean) as OrderItem[];

  ordered.forEach(item => {
    msg += `${item.productName} x ${item.quantity} ${item.unit}\n`;
  });

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
