import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch, OrderItem, FavoriteOrder } from '../types';

interface AppStore {
  selectedBranch: Branch | null;
  isAdmin: boolean;
  activeSupplier: string;
  activeView: 'orders' | 'poster' | 'missing';
  draftOrders: Record<string, OrderItem[]>;
  lastSavedOrders: Record<string, OrderItem[]>;
  favorites: FavoriteOrder[];

  setBranch: (branch: Branch | null) => void;
  setAdmin: (v: boolean) => void;
  setActiveSupplier: (id: string) => void;
  setActiveView: (view: 'orders' | 'poster' | 'missing') => void;
  updateDraft: (supplierId: string, items: OrderItem[]) => void;
  clearDraft: (supplierId: string) => void;
  saveLastOrder: (supplierId: string, items: OrderItem[]) => void;
  loadLastOrder: (supplierId: string) => boolean;
  addFavorite: (fav: FavoriteOrder) => void;
  removeFavorite: (id: string) => void;
  loadFavorite: (id: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      selectedBranch: null,
      isAdmin: false,
      activeSupplier: 'ozturkler',
      activeView: 'orders',
      draftOrders: {},
      lastSavedOrders: {},
      favorites: [],

      setBranch: (branch) => set({ selectedBranch: branch }),
      setAdmin: (v) => set({ isAdmin: v }),
      setActiveSupplier: (id) => set({ activeSupplier: id }),
      setActiveView: (view) => set({ activeView: view }),

      updateDraft: (supplierId, items) =>
        set((s) => ({ draftOrders: { ...s.draftOrders, [supplierId]: items } })),

      clearDraft: (supplierId) =>
        set((s) => ({ draftOrders: { ...s.draftOrders, [supplierId]: [] } })),

      saveLastOrder: (supplierId, items) =>
        set((s) => ({ lastSavedOrders: { ...s.lastSavedOrders, [supplierId]: items } })),

      loadLastOrder: (supplierId) => {
        const items = get().lastSavedOrders[supplierId];
        if (items?.length) {
          set((s) => ({ draftOrders: { ...s.draftOrders, [supplierId]: [...items] } }));
          return true;
        }
        return false;
      },

      addFavorite: (fav) =>
        set((s) => ({ favorites: [fav, ...s.favorites.slice(0, 4)] })),

      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter(f => f.id !== id) })),

      loadFavorite: (id) => {
        const fav = get().favorites.find(f => f.id === id);
        if (fav) {
          set((s) => ({
            draftOrders: { ...s.draftOrders, [fav.supplierId]: [...fav.items] },
            activeSupplier: fav.supplierId,
          }));
        }
      },
    }),
    {
      name: 'mutlukent-v2',
      partialize: (s) => ({
        selectedBranch: s.selectedBranch,
        lastSavedOrders: s.lastSavedOrders,
        favorites: s.favorites,
      }),
    }
  )
);
