"use client";

import { useCart } from "./CartProvider";
import { useState, useRef, useEffect } from "react";
import { swalSuccess, swalError, swalConfirm } from "../lib/swal";
import { ordersAPI } from "../lib/api";
import { useLoading } from "./LoadingProvider";

export default function CartModal() {
  const { items, removeItem, addItem, clear, open, setOpen } = useCart();
  const { withLoading } = useLoading();
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

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
                  <div className="text-sm text-gray-500">{it.preco}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(idx)}
                    aria-label={`Diminuir ${it.nome}`}
                    className="px-2 py-1 bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
                  >
                    −
                  </button>
                  <div className="px-2 text-sm text-gray-800">{it.quantidade}</div>
                  <button
                    onClick={() => addItem({ id: it.id, nome: it.nome, preco: it.preco })}
                    aria-label={`Aumentar ${it.nome}`}
                    className="px-2 py-1 bg-gray-100 rounded text-gray-800 hover:bg-gray-200"
                  >
                    +
                  </button>
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
            <button
              onClick={async () => {
                const res = await swalConfirm('Limpar carrinho', 'Deseja realmente limpar todo o carrinho?');
                if (!res.isConfirmed) return;
                clear();
                swalSuccess('Carrinho limpo', 'O carrinho foi esvaziado.');
              }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded font-medium"
              disabled={submitting}
            >
              Limpar carrinho
            </button>

            <button
              onClick={async () => {
                if (submitting) return;
                setSubmitting(true);
                try {
                  // Preparar itens para a API
                  // Verificar se temos IDs dos pratos (se foram salvos no item)
                  const itemsParaAPI = items.map(it => ({
                    pratoId: it.id || 0, // Se não tiver ID, usar 0 (precisará ajustar)
                    quantidade: it.quantidade
                  }));

                  // Verificar se todos os itens têm ID válido
                  const temIdInvalido = itemsParaAPI.some(it => it.pratoId === 0);

                  if (temIdInvalido) {
                    // Fallback: salvar no localStorage se não tiver IDs (modo offline)
                    const order = {
                      id: Date.now(),
                      items: items,
                      total: formatTotal(items),
                      createdAt: new Date().toISOString(),
                    };
                    const raw = localStorage.getItem("orders");
                    const arr = raw ? JSON.parse(raw) : [];
                    arr.push(order);
                    localStorage.setItem("orders", JSON.stringify(arr));

                    clear();
                    if (mountedRef.current) setSubmitting(false);
                    setOpen(false);
                    window.dispatchEvent(new Event("orders-updated"));
                    swalSuccess("Pedido salvo localmente", "Pedido salvo! (Modo offline)");
                  } else {
                    // Criar pedido via API
                    await withLoading(ordersAPI.create({ items: itemsParaAPI }));

                    clear();
                    if (mountedRef.current) setSubmitting(false);
                    setOpen(false);
                    window.dispatchEvent(new Event("orders-updated"));
                    swalSuccess("Pedido enviado", "Pedido enviado com sucesso!");
                  }
                } catch (error) {
                  console.error('Erro ao criar pedido:', error);
                  if (mountedRef.current) setSubmitting(false);
                  swalError("Erro", "Erro ao enviar pedido. Tente novamente.");
                }
              }}
              className={`px-4 py-2 ${submitting ? 'bg-gray-400' : 'bg-[#1e2939]'} text-white rounded font-medium`}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Pedir'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTotal(items: { nome: string; preco: string; quantidade: number }[]) {
  // Normaliza strings de preço que podem vir em formatos diferentes:
  // - 'R$ 12,50' -> 12.5
  // - '12.50' (ponto decimal) -> 12.5
  // - '1.234,56' (milhares com ponto, decimal com vírgula) -> 1234.56
  function parsePrice(preco: string): number {
    if (!preco) return 0;
    // manter somente dígitos, ponto, vírgula e traço
    const s = String(preco).replace(/[^0-9.,-]/g, "");
    if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
      // Assume ponto como separador de milhares e vírgula como decimal
      const cleaned = s.replace(/\./g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }
    if (s.indexOf(',') !== -1) {
      return parseFloat(s.replace(',', '.')) || 0;
    }
    return parseFloat(s) || 0;
  }

  const total = items.reduce((sum, it) => {
    const numeric = parsePrice(it.preco);
    return sum + numeric * (it.quantidade || 0);
  }, 0);
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
