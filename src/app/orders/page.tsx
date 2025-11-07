"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GraniteBackground from "../../components/GraniteBackground";
import { swalConfirm, swalSuccess, swalError, swalInfo } from "../../lib/swal";
import { ordersAPI, type Pedido } from "../../lib/api";
import { useOrdersSSE } from "../../hooks/useOrdersSSE";

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

  // Função auxiliar para transformar pedido do backend para o formato do frontend
  const transformOrder = (o: any): Order => {
    const items = (o.items || o.itens || []).map((it: any) => {
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

    const total = o.total || (items && Array.isArray(items)
      ? items.reduce((sum: number, it: any) => {
        const preco = it.preco ? parseFloat(String(it.preco).replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
        return sum + (preco * (it.quantidade || 1));
      }, 0)
      : 0);

    return {
      id: o.id,
      createdAt: o.createdAt || o.criadoEm || new Date().toISOString(),
      items,
      total: typeof total === 'number'
        ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : total,
      status: o.status || "pending",
    };
  };

  // SSE: Conectar ao servidor para receber atualizações em tempo real
  useOrdersSSE({
    onNewOrder: (newOrder) => {
      console.log('Novo pedido recebido via SSE:', newOrder);
      const transformed = transformOrder(newOrder);
      setOrders((prev) => [...prev, transformed]);

      // Mostrar notificação
      swalInfo(
        `Novo Pedido #${newOrder.id}`,
        `${transformed.items.length} ${transformed.items.length === 1 ? 'item' : 'itens'} - ${transformed.total}`
      );

      // Atualizar localStorage e disparar evento
      window.dispatchEvent(new Event("orders-updated"));
    },
    onOrderUpdate: (updatedOrder) => {
      console.log('Pedido atualizado via SSE:', updatedOrder);
      const transformed = transformOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? transformed : o))
      );
      window.dispatchEvent(new Event("orders-updated"));
    },
    onOrderDelete: (orderId) => {
      console.log('Pedido deletado via SSE:', orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      window.dispatchEvent(new Event("orders-updated"));
    },
    onError: (error) => {
      console.error('Erro na conexão SSE:', error);
    },
    enabled: true, // Sempre habilitado na página de pedidos
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const ordersData = await ordersAPI.list();
        const transformedOrders: Order[] = ordersData.map(transformOrder);
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
      .slice()
      .reverse();
  }, [orders, query, statusFilter, dateFrom, dateTo]);

  const totals = useMemo(() => {
    let count = filtered.length;
    let revenue = 0;
    for (const o of filtered) {
      const t = o.total;
      if (typeof t === "number") revenue += t;
      else if (typeof t === "string") {
        const n = parseFloat(t.replace(/[^0-9.,-]+/g, "").replace(/,/g, "."));
        if (!isNaN(n)) revenue += n;
      }
    }
    return { count, revenue };
  }, [filtered]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <Link href="/" className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-gray-700">← Voltar ao Dashboard</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{totals.count}</span></div>
          <div className="text-sm text-gray-600">Receita: <span className="font-semibold text-gray-900">R$ {totals.revenue.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar por id, item ou total..." className="w-full border px-3 py-2 rounded text-gray-800 bg-white placeholder:text-gray-700" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-700">
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border px-3 py-2 rounded w-full bg-white text-gray-700" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border px-3 py-2 rounded w-full bg-white text-gray-700" />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Carregando pedidos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600">Nenhum pedido encontrado com os filtros aplicados.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600">Pedido</div>
                    <div className="font-semibold text-gray-900">#{o.id}</div>
                    <div className="text-sm text-gray-400">•</div>
                    <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-800">
                    {Array.isArray(o.items) && o.items.map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="text-gray-800">{it.nome} x {it.quantidade}</div>
                        <div className="text-gray-700">{it.preco || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="font-bold text-gray-800">{o.total}</div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${(o.status || 'pending') === 'delivered' ? 'bg-emerald-100 text-emerald-800' : (o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800')}`}>
                      {o.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {o.status !== 'delivered' && (
                      <button onClick={() => markDelivered(o.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Marcar entregue</button>
                    )}
                    <button onClick={() => removeOrder(o.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Remover</button>
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
