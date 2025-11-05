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

  function addItem(item: { id?: number; nome: string; preco: string }) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.nome === item.nome);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantidade += 1;
        return copy;
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  }

  function removeItem(index: number) {
    setItems((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      copy[index].quantidade = Math.max(0, copy[index].quantidade - 1);
      if (copy[index].quantidade <= 0) {
        copy.splice(index, 1);
      }
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
