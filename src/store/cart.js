// Estado
import { create } from "zustand"; // Librería

const persistKey = "joyas_cart_v1"; // Clave

export const useCart = create((set, get) => ({ // Store
  items: JSON.parse(localStorage.getItem(persistKey) || "[]"), // Carga

  add(product, qty = 1) { // Agregar
    const items = [...get().items]; // Copia
    const idx = items.findIndex((i) => i.id === product.id); // Buscar
    if (idx >= 0) { // Existe
      items[idx].qty += qty; // Sumar
    } else {
      items.push({ ...product, qty }); // Nuevo
    }
    localStorage.setItem(persistKey, JSON.stringify(items)); // Guardar
    set({ items }); // Actualizar
  },

  remove(id) { // Eliminar
    const items = get().items.filter((i) => i.id !== id); // Filtro
    localStorage.setItem(persistKey, JSON.stringify(items)); // Guardar
    set({ items }); // Actualizar
  },

  setQty(id, qty) { // Cantidad
    const items = [...get().items]; // Copia
    const it = items.find((i) => i.id === id); // Buscar
    if (it) it.qty = Math.max(1, qty); // Validar
    localStorage.setItem(persistKey, JSON.stringify(items)); // Guardar
    set({ items }); // Actualizar
  },

  clear() { // Vaciar
    localStorage.removeItem(persistKey); // Borrar
    set({ items: [] }); // Reiniciar
  },

  total() { // Total
    return get().items.reduce((acc, i) => acc + i.price * i.qty, 0); // Calcular
  },
}));
