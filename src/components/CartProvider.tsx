"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id?: number; // ID do prato (opcional para compatibilidade) 
  nome: string;
  preco: string;
  quantidade: number
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: { id?: number; nome: string; preco: string }) => void;
  removeItem: (index: number) => void;
  clear: () => void;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cart_items") : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(items));
    } catch { }
  }, [items]);

  // Evita decrementos duplicados rápidos (por cliques duplos ou eventos duplicados)
  const isRemoving = React.useRef(false);

  function addItem(item: { id?: number; nome: string; preco: string }) {
    const key = item.id != null ? String(item.id) : String(item.nome).trim().toLowerCase();
    setItems((prev) => {
      // Consolidar possíveis entradas duplicadas existentes e somar quantidades
      const map = new Map<string, CartItem>();
      for (const p of prev) {
        const pKey = p.id != null ? String(p.id) : String(p.nome).trim().toLowerCase();
        const existing = map.get(pKey);
        if (existing) {
          existing.quantidade = (existing.quantidade || 0) + (p.quantidade || 0);
        } else {
          map.set(pKey, { ...p, quantidade: p.quantidade || 0 });
        }
      }

      const existing = map.get(key);
      if (existing) {
        existing.quantidade = (existing.quantidade || 0) + 1;
      } else {
        map.set(key, { id: item.id, nome: item.nome, preco: item.preco, quantidade: 1 });
      }

      return Array.from(map.values());
    });
  }

  function removeItem(index: number) {
    if (isRemoving.current) return;
    isRemoving.current = true;

    setItems((prev) => {
      const copy = [...prev];
      if (!copy[index]) {
        isRemoving.current = false;
        return prev;
      }
      copy[index] = { ...copy[index], quantidade: Math.max(0, copy[index].quantidade - 1) };
      if (copy[index].quantidade <= 0) {
        copy.splice(index, 1);
      }
      setTimeout(() => { isRemoving.current = false; }, 100);
      return copy;
    });
  }

  function clear() {
    setItems([]);
  }

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    clear,
    count: items.reduce((s, it) => s + it.quantidade, 0),
    open,
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
