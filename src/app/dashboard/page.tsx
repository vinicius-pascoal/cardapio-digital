"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";
import MenuTable from "../../components/MenuTable";

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
      <div className="p-4 bg-white/60 backdrop-blur-md border border-gray-200 rounded shadow-sm">
        <div className="text-sm text-gray-500">Pedidos hoje</div>
        <div className="text-2xl font-bold text-[#1e2939]">{ordersToday}</div>
      </div>
      <div className="p-4 bg-white/60 backdrop-blur-md border border-gray-200 rounded shadow-sm">
        <div className="text-sm text-gray-500">Pedidos este mês</div>
        <div className="text-2xl font-bold text-[#1e2939]">{ordersThisMonth}</div>
      </div>
      <div className="p-4 bg-white/60 backdrop-blur-md border border-gray-200 rounded shadow-sm">
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
        // reload and select
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
      alert("Escolha uma categoria existente ou crie uma nova categoria abaixo.");
      return;
    }
    try {
      const raw = localStorage.getItem("menu_categorias");
      const arr = raw ? JSON.parse(raw) : [];
      let cat = arr.find((c: any) => c.nome === selectedCategoria);
      if (!cat) {
        alert("Categoria selecionada não encontrada. Atualize a lista ou crie a categoria.");
        return;
      }
      cat.itens.push({ nome, preco, descricao });
      localStorage.setItem("menu_categorias", JSON.stringify(arr));
      window.dispatchEvent(new Event("menu-updated"));
      setNome(""); setPreco(""); setDescricao(""); setSelectedCategoria("");
      alert("Item adicionado ao cardápio");
    } catch (e) { console.error(e); alert("Erro ao salvar"); }
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
      alert("Informe o nome da categoria");
      return;
    }
    try {
      const raw = localStorage.getItem("menu_categorias");
      const arr = raw ? JSON.parse(raw) : [];
      const exists = arr.find((c: any) => c.nome === nome);
      if (exists) {
        alert("Categoria já existe");
        return;
      }
      arr.push({ nome, ativo: true, itens: [] });
      localStorage.setItem("menu_categorias", JSON.stringify(arr));
      window.dispatchEvent(new Event("menu-updated"));
      setNome("");
      // also dispatch a custom event so the AddMenuItemForm can select the new category
      window.dispatchEvent(new CustomEvent("category-created", { detail: { nome } }));
      alert("Categoria criada com sucesso");
    } catch (e) { console.error(e); alert("Erro ao criar categoria"); }
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
            <li key={o.id} className="p-2 border rounded">
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
      <main className="flex flex-col items-start min-h-screen overflow-y-auto overflow-x-hidden text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <nav className="w-full mb-6">
          <div className="w-full flex items-center justify-end gap-3 px-4 py-2 rounded">
            <a href="/" className="px-3 py-2 border rounded">Ver cardápio</a>
            <a href="/orders" className="px-3 py-2 bg-blue-600 text-white rounded">Ver pedidos</a>
            <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
          </div>
        </nav>
        <div className="w-full mb-6 border-gray-800 border-b-2 border-solid" />
        <div className="w-full px-8">
          <StatsCards />

          {/* Top: tabela à esquerda e pedidos à direita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="p-6 border rounded w-full">
              <h3 className="font-semibold mb-3">Itens do cardápio</h3>
              <MenuTable />
            </div>
            <div className="p-6 border rounded w-full">
              <h3 className="font-semibold mb-2">Pedidos</h3>
              <OrdersList />
            </div>
          </div>

          {/* Bottom: controladores de cadastro */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="p-6 border rounded w-full">
              <h3 className="font-semibold mb-2">Cadastrar / Adicionar item</h3>
              <AddMenuItemForm />
            </div>
            <div className="p-6 border rounded w-full">
              <h3 className="font-semibold mb-2">Cadastrar categoria</h3>
              <CreateCategoryForm />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            {/* Espaço para ações adicionais se necessário */}
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
