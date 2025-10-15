"use client";

import { useCart } from "./CartProvider";

export default function CartModal() {
  const { items, removeItem, clear, open, setOpen } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" className="relative z-70 w-full md:w-2/5 bg-white p-6 rounded-t-lg md:rounded-lg shadow-xl mx-4 mb-4 md:mb-0 border border-gray-300">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 focus:outline-none"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
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
                  <button onClick={() => removeItem(idx)} className="text-sm text-red-600">Remover 1</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex justify-between items-center text-gray-800">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatTotal(items)}</span>
          </div>
          <div className="flex justify-end items-center gap-3">
            <button onClick={() => { /* aqui poderia enviar pedido */ }} className="px-4 py-2 bg-[#1e2939] text-white rounded font-medium">Pedir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTotal(items: { nome: string; preco: string; quantidade: number }[]) {
  // preços no formato 'R$ 12,00' ou 'R$ 5,00'
  const total = items.reduce((sum, it) => {
    const numeric = parseFloat(it.preco.replace(/[R$\s\.]/g, "").replace(",", "."));
    return sum + numeric * it.quantidade;
  }, 0);
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
