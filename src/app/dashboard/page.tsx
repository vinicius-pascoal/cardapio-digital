"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";
import MenuTable from "../../components/MenuTable";
import { swalError, swalSuccess, swalConfirm } from "../../lib/swal";
import { categoriesAPI, dishesAPI, ordersAPI, type Categoria, type Prato, type Pedido } from "../../lib/api";

function StatsCards() {
  const [ordersToday, setOrdersToday] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [mostOrdered, setMostOrdered] = useState<{ nome: string; quantidade: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        // Buscar pedidos da API
        const orders = await ordersAPI.list();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let todayCount = 0;
        let monthCount = 0;
        const dishCounts: Record<string, number> = {};

        for (const o of orders) {
          const d = new Date(o.createdAt || '');
          if (d >= startOfToday) todayCount++;
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) monthCount++;
          if (Array.isArray(o.items)) {
            for (const it of o.items) {
              const name = it.prato?.nome || "Desconhecido";
              const q = it.quantidade || 1;
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
        console.error('Erro ao carregar estatísticas:', e);
        // Fallback para localStorage
        loadStatsFromLocalStorage();
      }
    }

    function loadStatsFromLocalStorage() {
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await categoriesAPI.list();
        setCategorias(cats);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        // Fallback para localStorage
        try {
          const raw = localStorage.getItem("menu_categorias");
          const arr = raw ? JSON.parse(raw) : [];
          setCategorias(arr);
        } catch {
          setCategorias([]);
        }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategoria) {
      swalError("Escolha uma categoria", "Escolha uma categoria existente ou crie uma nova categoria abaixo.");
      return;
    }
    try {
      // Encontrar o ID da categoria selecionada
      const categoria = categorias.find((c: any) => c.nome === selectedCategoria || c.id.toString() === selectedCategoria);
      if (!categoria) {
        swalError("Categoria não encontrada", "Atualize a lista ou crie a categoria.");
        return;
      }

      // Converter preço de string para número
      const precoNumerico = parseFloat(preco.replace('R$', '').replace(',', '.').trim());
      if (isNaN(precoNumerico)) {
        swalError("Preço inválido", "Digite um preço válido (ex: 10.50 ou R$ 10,50)");
        return;
      }

      // Criar prato via API
      await dishesAPI.create({
        nome,
        descricao: descricao || undefined,
        preco: precoNumerico,
        categoriaId: categoria.id,
      });

      window.dispatchEvent(new Event("menu-updated"));
      setNome(""); setPreco(""); setDescricao(""); setSelectedCategoria("");
      swalSuccess("Item adicionado", "Item adicionado ao cardápio com sucesso.");
    } catch (err) {
      console.error(err);
      swalError("Erro", "Erro ao salvar item no backend.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Categoria</label>
      <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required>
        <option value="">-- Selecione uma categoria --</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id.toString()}>{c.nome}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 gap-2">
        <input placeholder="Nome do item" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required />
        <input placeholder="Preço (ex: 10.50 ou R$ 10,50)" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]" required />
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      swalError("Campo vazio", "Informe o nome da categoria");
      return;
    }
    try {
      // Criar categoria via API
      const novaCategoria = await categoriesAPI.create({ nome: nome.trim() });

      window.dispatchEvent(new Event("menu-updated"));
      setNome("");
      window.dispatchEvent(new CustomEvent("category-created", { detail: { nome: novaCategoria.nome } }));
      swalSuccess("Categoria criada", "Categoria criada com sucesso");
    } catch (err: any) {
      console.error(err);
      // Verificar se é erro de duplicação
      if (err.message?.includes('já existe') || err.message?.includes('duplicate')) {
        swalError("Já existe", "Categoria já existe");
      } else {
        swalError("Erro", "Erro ao criar categoria no backend.");
      }
    }
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
    async function load() {
      try {
        const ordersData = await ordersAPI.list();
        setOrders(ordersData);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        // Fallback para localStorage
        try {
          const raw = localStorage.getItem("orders");
          setOrders(raw ? JSON.parse(raw) : []);
        } catch {
          setOrders([]);
        }
      }
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
          {orders.map((o) => {
            // Calcular total se não vier da API
            const total = o.total || (o.items && Array.isArray(o.items)
              ? o.items.reduce((sum: number, it: any) => {
                const preco = it.prato?.preco || 0;
                return sum + (preco * (it.quantidade || 1));
              }, 0)
              : 0);

            const totalFormatado = typeof total === 'number'
              ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : total;

            return (
              <li key={o.id} className="p-2 border rounded bg-white/70">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Pedido #{o.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(o.createdAt || '').toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="font-semibold">{totalFormatado}</div>
                </div>
                <ul className="text-sm mt-2">
                  {o.items && o.items.map((it: any, i: number) => {
                    const nomePrato = it.prato?.nome || it.nome || "Item desconhecido";
                    return (
                      <li key={i}>{nomePrato} x {it.quantidade}</li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategoriesTable() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadCategorias();
    window.addEventListener("menu-updated", loadCategorias);
    return () => window.removeEventListener("menu-updated", loadCategorias);
  }, []);

  async function loadCategorias() {
    try {
      setLoading(true);
      const cats = await categoriesAPI.list();
      setCategorias(cats);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      swalError("Erro", "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, nome: string) {
    const res = await swalConfirm("Remover categoria", `Remover a categoria "${nome}"? Todos os pratos desta categoria também serão removidos.`);
    if (!res.isConfirmed) return;

    try {
      await categoriesAPI.delete(id);
      window.dispatchEvent(new Event("menu-updated"));
      swalSuccess("Removida", "Categoria removida com sucesso");
    } catch (err: any) {
      console.error('Erro ao remover categoria:', err);
      let mensagem = "Erro ao remover categoria";

      // Extrair mensagem de erro mais específica
      if (err.message) {
        if (err.message.includes('404')) {
          mensagem = "Categoria não encontrada. Pode já ter sido removida.";
        } else if (err.message.includes('não encontrada')) {
          mensagem = "Categoria não encontrada no servidor.";
        } else {
          mensagem = err.message;
        }
      }

      swalError("Erro", mensagem);
      // Recarregar a lista mesmo em caso de erro
      loadCategorias();
    }
  }

  const totalPages = Math.ceil(categorias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategorias = categorias.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <div className="text-center py-4">Carregando categorias...</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">ID</th>
              <th className="px-4 py-2 text-left font-semibold">Nome</th>
              <th className="px-4 py-2 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategorias.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                  Nenhuma categoria cadastrada
                </td>
              </tr>
            ) : (
              paginatedCategorias.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{cat.id}</td>
                  <td className="px-4 py-2 font-medium">{cat.nome}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(cat.id, cat.nome)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

function DishesTable() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadData();
    window.addEventListener("menu-updated", loadData);
    return () => window.removeEventListener("menu-updated", loadData);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pratosData, categoriasData] = await Promise.all([
        dishesAPI.list(),
        categoriesAPI.list(),
      ]);
      setPratos(pratosData);
      setCategorias(categoriasData);
    } catch (err) {
      console.error('Erro ao carregar pratos:', err);
      swalError("Erro", "Erro ao carregar pratos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, nome: string) {
    const res = await swalConfirm("Remover prato", `Remover o prato "${nome}"?`);
    if (!res.isConfirmed) return;

    try {
      await dishesAPI.delete(id);
      window.dispatchEvent(new Event("menu-updated"));
      swalSuccess("Removido", "Prato removido com sucesso");
    } catch (err: any) {
      console.error('Erro ao remover prato:', err);
      let mensagem = "Erro ao remover prato";

      // Extrair mensagem de erro mais específica
      if (err.message) {
        if (err.message.includes('404')) {
          mensagem = "Prato não encontrado. Pode já ter sido removido.";
        } else if (err.message.includes('não encontrado')) {
          mensagem = "Prato não encontrado no servidor.";
        } else {
          mensagem = err.message;
        }
      }

      swalError("Erro", mensagem);
      // Recarregar a lista mesmo em caso de erro
      loadData();
    }
  }

  function getCategoriaNome(categoriaId: number): string {
    const cat = categorias.find(c => c.id === categoriaId);
    return cat?.nome || "Sem categoria";
  }

  function formatPrice(preco: any): string {
    if (typeof preco === 'number') {
      return `R$ ${preco.toFixed(2).replace('.', ',')}`;
    } else if (typeof preco === 'string') {
      return preco.startsWith('R$') ? preco : `R$ ${preco}`;
    }
    return 'R$ 0,00';
  }

  const totalPages = Math.ceil(pratos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPratos = pratos.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <div className="text-center py-4">Carregando pratos...</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">ID</th>
              <th className="px-4 py-2 text-left font-semibold">Nome</th>
              <th className="px-4 py-2 text-left font-semibold">Categoria</th>
              <th className="px-4 py-2 text-right font-semibold">Preço</th>
              <th className="px-4 py-2 text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPratos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                  Nenhum prato cadastrado
                </td>
              </tr>
            ) : (
              paginatedPratos.map((prato) => (
                <tr key={prato.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{prato.id}</td>
                  <td className="px-4 py-2 font-medium">{prato.nome}</td>
                  <td className="px-4 py-2 text-gray-600">{getCategoriaNome(prato.categoriaId)}</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatPrice(prato.preco)}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(prato.id, prato.nome)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Próxima
          </button>
        </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="p-6 bg-white/60 backdrop-blur rounded-xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Categorias</h3>
              <CategoriesTable />
            </div>

            <div className="p-6 bg-white/60 backdrop-blur rounded-xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Pedidos recentes</h3>
              <OrdersList />
            </div>
          </div>

          <div className="mb-8 p-6 bg-white/60 backdrop-blur rounded-xl shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Pratos do cardápio</h3>
            <DishesTable />
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
