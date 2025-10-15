"use client";

import { useCart } from "./CartProvider";

export default function CartModal() {
  const { items, removeItem, clear, open, setOpen } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" className="relative z-70 w-full md:w-2/5 bg-white p-6 rounded-t-lg md:rounded-lg shadow-xl mx-4 mb-4 md:mb-0 border border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-[#1e2939]">Seu carrinho</h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Carrinho vazio</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-[#1e2939]">{it.nome}</div>
                  <div className="text-sm text-gray-500">{it.preco} x {it.quantidade}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => removeItem(idx)} className="text-sm text-red-600">Remover</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-between items-center">
          <button onClick={() => { clear(); }} className="px-3 py-2 border rounded text-sm border-gray-300">Limpar</button>
          <button onClick={() => setOpen(false)} className="px-3 py-2 bg-[#1e2939] text-white rounded">Fechar</button>
        </div>
      </div>
    </div>
  );
}
