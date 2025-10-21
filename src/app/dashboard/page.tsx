"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";
import MenuTable from "../../components/MenuTable";
import { swalError, swalSuccess } from "../../lib/swal";

function StatsCards() {
  const [ordersToday, setOrdersToday] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [mostOrdered, setMostOrdered] = useState<{ nome: string; quantidade: number } | null>(null);

  useEffect(() => {
    function loadStats() {
      try {
        const raw = localStorage.getItem("orders");
        const orders = raw ? JSON.parse(raw) : [];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let todayCount = 0;
        let monthCount = 0;
        const dishCounts: Record<string, number> = {};

        for (const o of orders) {
          const d = new Date(o.createdAt);
          if (d >= startOfToday) todayCount++;
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) monthCount++;
          if (Array.isArray(o.items)) {
            for (const it of o.items) {
              const name = it.nome || it.name || "Desconhecido";
              const q = typeof it.quantidade === "number" ? it.quantidade : (parseInt(it.quantidade) || 1);
              dishCounts[name] = (dishCounts[name] || 0) + q;
            }
          }
        }

        let top: { nome: string; quantidade: number } | null = null;
        for (const [nome, quantidade] of Object.entries(dishCounts)) {
          if (!top || quantidade > top.quantidade) top = { nome, quantidade };
        }

        setOrdersToday(todayCount);
        setOrdersThisMonth(monthCount);
        setMostOrdered(top);
      } catch (e) {
        setOrdersToday(0);
        setOrdersThisMonth(0);
        setMostOrdered(null);
      }
    }

    loadStats();
    window.addEventListener("orders-updated", loadStats);
    return () => window.removeEventListener("orders-updated", loadStats);
  }, []);

  return (
    <div className="w-full mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm">
        <div className="text-sm text-gray-500">Pedidos hoje</div>
        <div className="text-2xl font-bold text-[#1e2939]">{ordersToday}</div>
      </div>
      <div className="p-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm">
        <div className="text-sm text-gray-500">Pedidos este mês</div>
        <div className="text-2xl font-bold text-[#1e2939]">{ordersThisMonth}</div>
      </div>
      <div className="p-4 bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl shadow-sm">
        <div className="text-sm text-gray-500">Prato mais pedido</div>
        {mostOrdered ? (
          <div className="text-lg font-semibold">{mostOrdered.nome} <span className="text-sm text-gray-600">({mostOrdered.quantidade})</span></div>
        ) : (
          <div className="text-sm text-gray-600">Nenhum pedido</div>
        )}
      </div>
    </div>
  );
}

function AddMenuItemForm() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    function loadCats() {
      try {
        const raw = localStorage.getItem("menu_categorias");
        const arr = raw ? JSON.parse(raw) : [];
        setCategorias(arr.map((c: any) => c.nome));
      } catch {
        setCategorias([]);
      }
    }
    loadCats();
    window.addEventListener("menu-updated", loadCats);
    function handleCreated(e: any) {
      if (e?.detail?.nome) {
        loadCats();
        setSelectedCategoria(e.detail.nome);
      }
    }
    window.addEventListener("category-created", handleCreated as EventListener);
    return () => {
      window.removeEventListener("menu-updated", loadCats);
      window.removeEventListener("category-created", handleCreated as EventListener);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategoria) {
      swalError("Escolha uma categoria", "Escolha uma categoria existente ou crie uma nova categoria abaixo.");
      return;
    }
    try {
      const raw = localStorage.getItem("menu_categorias");
      const arr = raw ? JSON.parse(raw) : [];
      let cat = arr.find((c: any) => c.nome === selectedCategoria);
      if (!cat) {
        swalError("Categoria não encontrada", "Atualize a lista ou crie a categoria.");
        return;
      }
      cat.itens.push({ nome, preco, descricao });
      localStorage.setItem("menu_categorias", JSON.stringify(arr));
      window.dispatchEvent(new Event("menu-updated"));
      setNome(""); setPreco(""); setDescricao(""); setSelectedCategoria("");
      swalSuccess("Item adicionado", "Item adicionado ao cardápio com sucesso.");
    } catch (e) { console.error(e); swalError("Erro", "Erro ao salvar"); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Categoria</label>
      <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required>
        <option value="">-- Selecione uma categoria --</option>
        {categorias.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 gap-2">
        <input placeholder="Nome do item" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required />
        <input placeholder="Preço (ex: R$ 10,00)" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required />
        <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-[#1e2939] hover:bg-[#16202a] text-white rounded shadow">Adicionar</button>
      </div>
    </form>
  );
}

function CreateCategoryForm() {
  const [nome, setNome] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      swalError("Campo vazio", "Informe o nome da categoria");
      return;
    }
    try {
      const raw = localStorage.getItem("menu_categorias");
      const arr = raw ? JSON.parse(raw) : [];
      const exists = arr.find((c: any) => c.nome === nome);
      if (exists) {
        swalError("Já existe", "Categoria já existe");
        return;
      }
      arr.push({ nome, ativo: true, itens: [] });
      localStorage.setItem("menu_categorias", JSON.stringify(arr));
      window.dispatchEvent(new Event("menu-updated"));
      setNome("");
      window.dispatchEvent(new CustomEvent("category-created", { detail: { nome } }));
      swalSuccess("Categoria criada", "Categoria criada com sucesso");
    } catch (e) { console.error(e); swalError("Erro", "Erro ao criar categoria"); }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-2">
      <input placeholder="Nome da categoria" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow">Criar categoria</button>
      </div>
    </form>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("orders");
        setOrders(raw ? JSON.parse(raw) : []);
      } catch { setOrders([]); }
    }
    load();
    window.addEventListener("orders-updated", load);
    return () => window.removeEventListener("orders-updated", load);
  }, []);

  return (
    <div>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum pedido</p>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-y-auto">
          {orders.map((o) => (
            <li key={o.id} className="p-2 border rounded bg-white/70">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">Pedido #{o.id}</div>
                  <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="font-semibold">{o.total}</div>
              </div>
              <ul className="text-sm mt-2">
                {o.items.map((it: any, i: number) => (
                  <li key={i}>{it.nome} x {it.quantidade}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("auth_token");
    if (!t) {
      router.replace("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    router.push("/login");
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <GraniteBackground>
      <main className="min-h-screen py-10 text-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Visão geral do cardápio, pedidos e controle rápido</p>
            </div>

            <nav className="flex items-center gap-3">
              <a href="/" className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50">Ver cardápio</a>
              <a href="/orders" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">Ver pedidos</a>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700">Logout</button>
            </nav>
          </header>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 bg-white/60 backdrop-blur rounded-xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Itens do cardápio</h3>
              <MenuTable />
            </div>

            <aside className="p-6 bg-white/60 backdrop-blur rounded-xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Pedidos recentes</h3>
              <OrdersList />
            </aside>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/60 backdrop-blur rounded-xl shadow-lg border border-gray-200">
              <h4 className="font-semibold mb-3">Adicionar item ao cardápio</h4>
              <AddMenuItemForm />
            </div>
            <div className="p-6 bg-white/60 backdrop-blur rounded-xl shadow-lg border border-gray-200">
              <h4 className="font-semibold mb-3">Criar nova categoria</h4>
              <CreateCategoryForm />
            </div>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
