"use client";

import React, { useEffect, useMemo, useState } from "react";
import GraniteBackground from "../../components/GraniteBackground";

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

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("orders");
        setOrders(raw ? JSON.parse(raw) : []);
      } catch {
        setOrders([]);
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

  function removeOrder(id: Order["id"]) {
    if (!confirm("Remover este pedido? A ação não pode ser desfeita.")) return;
    const next = orders.filter((o) => o.id !== id);
    saveOrders(next);
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
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
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

      {filtered.length === 0 ? (
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
