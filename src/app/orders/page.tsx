"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GraniteBackground from "../../components/GraniteBackground";
import { swalConfirm, swalSuccess, swalError } from "../../lib/swal";
import { ordersAPI, type Pedido } from "../../lib/api";

type OrderItem = {
  nome: string;
  quantidade: number;
  preco?: string;
};

type Order = {
  id: string | number;
  createdAt: string;
  items: OrderItem[];
  total?: string | number;
  status?: string; // e.g., pending, delivered, cancelled
};

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Buscar pedidos da API
        const ordersData = await ordersAPI.list();

        // Transformar usando campos da API: 'itens' e 'criadoEm'
        const transformedOrders: Order[] = ordersData.map((o: any) => {
          // API retorna 'itens' com 'prato' incluído
          const items = (o.itens || o.items || []).map((it: any) => {
            const prato = it.prato || {};
            const preco = prato.preco;
            let precoFormatado: string | undefined;
            if (preco !== undefined && preco !== null) {
              if (typeof preco === 'number') {
                precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
              } else if (typeof preco === 'string') {
                const n = parseFloat(preco.replace(/[^\d.,]/g, '').replace(',', '.'));
                precoFormatado = isNaN(n) ? preco : `R$ ${n.toFixed(2).replace('.', ',')}`;
              }
            }
            return {
              nome: prato.nome || "Desconhecido",
              quantidade: it.quantidade,
              preco: precoFormatado,
            };
          });

          // API retorna 'total' já calculado
          const total = o.total;

          return {
            id: o.id,
            createdAt: o.criadoEm || o.createdAt || new Date().toISOString(),
            items,
            total: typeof total === 'number'
              ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : total,
            status: o.status || "pending",
          };
        });

        setOrders(transformedOrders);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        // Fallback para localStorage
        try {
          const raw = localStorage.getItem("orders");
          setOrders(raw ? JSON.parse(raw) : []);
        } catch {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    window.addEventListener("orders-updated", load);
    return () => window.removeEventListener("orders-updated", load);
  }, []);

  function saveOrders(next: Order[]) {
    localStorage.setItem("orders", JSON.stringify(next));
    window.dispatchEvent(new Event("orders-updated"));
    setOrders(next);
  }

  function markDelivered(id: Order["id"]) {
    const next = orders.map((o) => (o.id === id ? { ...o, status: "delivered" } : o));
    saveOrders(next);
  }

  async function removeOrder(id: Order["id"]) {
    const res = await swalConfirm("Remover pedido", "Remover este pedido? A ação não pode ser desfeita.");
    if (!res.isConfirmed) return;
    try {
      // Tentar remover via API
      await ordersAPI.delete(Number(id));
      const next = orders.filter((o) => o.id !== id);
      setOrders(next);
      window.dispatchEvent(new Event("orders-updated"));
      swalSuccess("Removido", "Pedido removido com sucesso");
    } catch (err) {
      console.error('Erro ao remover pedido:', err);
      // Fallback: remover do localStorage
      try {
        const next = orders.filter((o) => o.id !== id);
        saveOrders(next);
        swalSuccess("Removido", "Pedido removido localmente");
      } catch (e) {
        swalError("Erro", "Não foi possível remover o pedido");
      }
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return orders
      .filter((o) => {
        // status filter
        const st = o.status || "pending";
        if (statusFilter !== "all" && st !== statusFilter) return false;
        // date filter
        try {
          const d = new Date(o.createdAt);
          if (from && d < from) return false;
          if (to) {
            const end = new Date(to);
            end.setHours(23, 59, 59, 999);
            if (d > end) return false;
          }
        } catch { /* ignore date parse errors */ }

        // query filter: id or item name or total
        if (!q) return true;
        if (String(o.id).toLowerCase().includes(q)) return true;
        if (String(o.total || "").toLowerCase().includes(q)) return true;
        if (Array.isArray(o.items)) {
          for (const it of o.items) {
            if ((it.nome || "").toLowerCase().includes(q)) return true;
          }
        }
        return false;
      })
      .sort((a, b) => {
        // Ordenar por data de criação: mais recentes primeiro
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [orders, query, statusFilter, dateFrom, dateTo]);

  const totalCount = useMemo(() => filtered.length, [filtered]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 pb-6 border-b-2 border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">Gerenciar Pedidos</h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link href="/dashboard" className="px-5 py-2.5 bg-white border-2 border-[#1e2939] text-[#1e2939] rounded-lg hover:bg-[#1e2939] hover:text-white font-medium transition-colors flex items-center gap-2 shadow-md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white/80 backdrop-blur rounded-2xl border-2 border-gray-200 shadow-lg mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Buscar</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ID, item ou total..." className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Período</label>
            <div className="flex gap-2">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-2 border-gray-300 px-3 py-2 rounded-lg w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-2 border-gray-300 px-3 py-2 rounded-lg w-full bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Carregando pedidos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600">Nenhum pedido encontrado com os filtros aplicados.</p>
      ) : (
        <div className="space-y-5">
          {filtered.map((o) => (
            <div key={o.id} className="p-6 border-2 border-gray-200 rounded-2xl bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Pedido</div>
                      <div className="font-bold text-lg text-gray-900">#{o.id}</div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="pl-14 space-y-2">
                    {Array.isArray(o.items) && o.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{it.nome}</span>
                          <span className="text-xs text-gray-500">x {it.quantidade}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{it.preco || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 md:min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">{o.total}</span>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${(o.status || 'pending') === 'delivered' ? 'bg-emerald-100 text-emerald-800' : (o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800')}`}>
                      {o.status === 'delivered' ? '✓ Entregue' : o.status === 'cancelled' ? '✕ Cancelado' : '⏳ Pendente'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {o.status !== 'delivered' && (
                      <button onClick={() => markDelivered(o.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Entregar
                      </button>
                    )}
                    <button onClick={() => removeOrder(o.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <GraniteBackground>
      <main className="min-h-screen py-8">
        <OrdersPageContent />
      </main>
    </GraniteBackground>
  );
}
