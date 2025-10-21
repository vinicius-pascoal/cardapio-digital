"use client";

import { useEffect, useRef } from "react";
import { swalInfo } from "../lib/swal";
import { usePathname } from "next/navigation";

export default function NewOrderNotifier() {
  const lastSeen = useRef<number | string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Inicializa lastSeen silenciosamente para não mostrar o último pedido ao carregar
    try {
      const raw = localStorage.getItem("orders");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && arr.length > 0) {
        const latest = arr[arr.length - 1];
        lastSeen.current = latest?.id ? String(latest.id) : null;
      }
    } catch (e) {
      // ignore
    }

    function onOrdersUpdated() {
      try {
        // só mostramos o alerta se estivermos na rota /orders
        if (pathname !== "/orders") return;
        const raw = localStorage.getItem("orders");
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr) || arr.length === 0) return;
        const latest = arr[arr.length - 1];
        if (!latest) return;
        if (lastSeen.current && String(latest.id) === String(lastSeen.current)) return;
        // novo pedido
        lastSeen.current = String(latest.id);
        const itemsHtml = (latest.items || []).map((it: any) => `<div>${it.nome} x ${it.quantidade} — ${it.preco || ''}</div>`).join("");
        swalInfo(`Pedido novo #${latest.id}`, `Total: ${latest.total || ''}<br/>${itemsHtml}`);
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener("orders-updated", onOrdersUpdated);
    return () => window.removeEventListener("orders-updated", onOrdersUpdated);
  }, []);

  return null;
}
