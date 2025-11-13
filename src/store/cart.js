// Estado
import { create } from "zustand"; // Librería

const persistKey = "joyas_cart_v1"; // Clave
const debounce = (fn, wait = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(persistKey) || "[]");
  } catch (e) {
    console.warn('cart load error', e);
    return [];
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(persistKey, JSON.stringify(items));
  } catch (e) {
    console.warn('cart save error', e);
  }
}

export const useCart = create((set, get) => ({ // Store
  items: loadItems(), // [{ productId, id, name, price, qty, image }]

  // Helper: normalize product object into cart-item
  _normalize(product, qty = 1) {
    const productId = product._id || product.id || null;
    return {
      productId,
      id: product.id || null,
      name: product.name || '',
      price: Number(product.price || 0),
      image: (product.images && product.images[0]) || null,
      qty: Math.max(1, Number(qty || 1))
    };
  },

  add(product, qty = 1) {
    const items = [...get().items];
    const item = get()._normalize(product, qty);
    if (!item.productId && !item.id) {
      console.warn('Trying to add invalid product to cart', product);
      return;
    }
    const idx = items.findIndex(i => (i.productId && item.productId ? i.productId === item.productId : i.id === item.id));
    if (idx >= 0) {
      items[idx].qty = Math.max(1, items[idx].qty + item.qty);
    } else {
      items.push(item);
    }
    set({ items });
    saveItems(items);
  },

  remove(productIdOrId) {
    const items = get().items.filter(i => !(i.productId === productIdOrId || i.id === productIdOrId));
    set({ items });
    saveItems(items);
  },

  setQty(productIdOrId, qty) {
    const items = [...get().items];
    const idx = items.findIndex(i => i.productId === productIdOrId || i.id === productIdOrId);
    if (idx === -1) return;
    items[idx].qty = Math.max(1, Number(qty || 1));
    set({ items });
    saveItems(items);
  },

  clear() {
    set({ items: [] });
    saveItems([]);
  },

  total() {
    return get().items.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.qty || 0)), 0);
  },

  count() {
    return get().items.reduce((acc, i) => acc + Number(i.qty || 0), 0);
  },

  itemsNormalized() {
    return get().items.map(i => ({ ...i }));
  },

  // Async: sync cart to backend (use /sync which maps logical ids -> ObjectIds)
  async syncToServer(cartId) {
    try {
      if (!cartId) throw new Error('cartId required to sync');
      const API_BASE = import.meta.env.VITE_API_URL || '';
      // send simple items array expected by /carts/:cid/sync
      const items = get().items.map(i => ({ id: i.id || i.productId, qty: i.qty }));
      const url = `${API_BASE}/carts/${cartId}/sync`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Sync failed${text ? `: ${text}` : ''}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('syncToServer error', err);
      throw err;
    }
  },

  // Async: load cart from server and replace local cart
  async loadFromServer(cartId) {
    try {
      if (!cartId) throw new Error('cartId required to load');
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/carts/${cartId}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Load failed${txt ? `: ${txt}` : ''}`);
      }
      const data = await res.json();
      // data.payload expected (server returns {status,payload:cart})
      const cart = data.payload || data;
      const items = (cart.products || []).map(p => ({
        productId: p.product?._id || p.product,
        id: p.product?.id || null,
        name: p.product?.name || '',
        price: Number(p.product?.price || 0),
        image: (p.product?.images && p.product.images[0]) || null,
        qty: Number(p.quantity || p.qty || 1)
      }));
      set({ items });
      saveItems(items);
      return items;
    } catch (err) {
      console.error('loadFromServer error', err);
      throw err;
    }
  }
}));
