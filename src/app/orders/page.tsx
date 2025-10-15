"use client";

import React, { useEffect, useState } from "react";
import GraniteBackground from "../../components/GraniteBackground";

function OrdersPageContent() {
  const [orders, setOrders] = useState<any[]>([]);

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

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-4">
          {orders.slice().reverse().map((o: any) => (
            <div key={o.id} className="p-4 border rounded bg-white/60">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold">Pedido #{o.id}</div>
                  <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="font-bold">{o.total}</div>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {Array.isArray(o.items) && o.items.map((it: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <div>{it.nome} x {it.quantidade}</div>
                    <div className="text-gray-600">{it.preco || ''}</div>
                  </li>
                ))}
              </ul>
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
