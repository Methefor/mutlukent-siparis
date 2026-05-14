export interface Branch {
  id: string;
  name: string;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  step?: number;
  emoji: string;
  category?: string;
  subcategory?: string;
  presets?: number[];
}

export interface Supplier {
  id: string;
  name: string;
  emoji: string;
  phone?: string;
  schedule: {
    writeDays: number[];
    writeLabel: string;
    deliveryLabel: string;
  };
  products: Product[];
  categoryEmojis?: Record<string, string>;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  emoji: string;
}

export interface Order {
  id?: string;
  branchId: string;
  branchName: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  status: 'draft' | 'sent' | 'confirmed';
  date: string;
  createdAt: string;
  sentAt?: string | null;
}

export interface FavoriteOrder {
  id: string;
  name: string;
  supplierId: string;
  items: OrderItem[];
  createdAt: string;
}
