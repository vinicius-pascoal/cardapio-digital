"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";

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
    return () => window.removeEventListener("menu-updated", loadCats);
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium">Categoria</label>
      <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} className="w-full border px-2 py-1 rounded" required>
        <option value="">-- Selecione uma categoria --</option>
        {categorias.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input placeholder="Nome do item" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      <input placeholder="Preço (ex: R$ 10,00)" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      <input placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border px-2 py-1 rounded" />
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-2 bg-[#1e2939] text-white rounded">Adicionar</button>
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
      alert("Categoria criada com sucesso");
    } catch (e) { console.error(e); alert("Erro ao criar categoria"); }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-2">
      <input placeholder="Nome da categoria" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Criar categoria</button>
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
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-28 h-28 mb-4 mt-10"
          priority
        />
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="w-4/5 mb-6 border-gray-800 border-b-2 border-solid" />
        <div className="w-full max-w-3xl px-4">
          <p className="mb-4">Área administrativa simulada.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Adicionar item ao cardápio</h3>
              <AddMenuItemForm />
              <div className="mt-4">
                <h4 className="font-medium mb-2">Criar nova categoria</h4>
                <CreateCategoryForm />
              </div>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Pedidos</h3>
              <OrdersList />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
            <a href="/" className="px-3 py-2 border rounded">Ver cardápio</a>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
