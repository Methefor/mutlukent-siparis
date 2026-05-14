import { useState, useCallback } from 'react';
import type { Order } from '../types';
import { isFirebaseConfigured, db } from '../lib/firebase';

const STORAGE_KEY = 'mutlukent_orders_v2';
const MAX_LOCAL = 200;

export function useOrders() {
  const [loading, setLoading] = useState(false);

  const saveOrder = useCallback(async (data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const order: Order = { ...data, createdAt: new Date().toISOString() };

    if (isFirebaseConfigured && db) {
      try {
        const { collection, addDoc, Timestamp } = await import('firebase/firestore');
        const ref = await addDoc(collection(db, 'orders'), {
          ...order,
          createdAt: Timestamp.now(),
        });
        return { ...order, id: ref.id };
      } catch {
        // fall through to localStorage
      }
    }

    const stored: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const saved = { ...order, id: `local_${Date.now()}` };
    stored.unshift(saved);
    if (stored.length > MAX_LOCAL) stored.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return saved;
  }, []);

  const fetchOrders = useCallback(async (filters?: {
    branchId?: string;
    supplierId?: string;
    date?: string;
    limit?: number;
  }): Promise<Order[]> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && db) {
        const { collection, query, where, orderBy, limit: fbLimit, getDocs } =
          await import('firebase/firestore');

        const constraints: Parameters<typeof query>[1][] = [
          orderBy('createdAt', 'desc'),
          fbLimit(filters?.limit ?? 100),
        ];
        if (filters?.branchId) constraints.push(where('branchId', '==', filters.branchId));
        if (filters?.supplierId) constraints.push(where('supplierId', '==', filters.supplierId));
        if (filters?.date) constraints.push(where('date', '==', filters.date));

        const q = query(collection(db, 'orders'), ...constraints);
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
          const d = doc.data();
          return {
            ...(d as Order),
            id: doc.id,
            createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? d.createdAt,
          };
        });
      }
    } catch {
      // fall through
    } finally {
      setLoading(false);
    }

    let orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (filters?.branchId) orders = orders.filter(o => o.branchId === filters.branchId);
    if (filters?.supplierId) orders = orders.filter(o => o.supplierId === filters.supplierId);
    if (filters?.date) orders = orders.filter(o => o.date === filters.date);
    if (filters?.limit) orders = orders.slice(0, filters.limit);
    setLoading(false);
    return orders;
  }, []);

  const updateStatus = useCallback(async (orderId: string, status: Order['status']): Promise<void> => {
    if (isFirebaseConfigured && db && !orderId.startsWith('local_')) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'orders', orderId), { status });
        return;
      } catch { /* fall through */ }
    }
    const stored: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const idx = stored.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      stored[idx].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  }, []);

  return { loading, saveOrder, fetchOrders, updateStatus };
}
