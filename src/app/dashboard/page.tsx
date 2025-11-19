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
    <div className="w-full mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-md border border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-sm font-medium text-blue-700">Pedidos hoje</div>
        </div>
        <div className="text-3xl font-extrabold text-blue-900">{ordersToday}</div>
      </div>
      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/80 backdrop-blur-md border border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-green-700">Pedidos este mês</div>
        </div>
        <div className="text-3xl font-extrabold text-green-900">{ordersThisMonth}</div>
      </div>
      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/80 backdrop-blur-md border border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-purple-700">Prato mais pedido</div>
        </div>
        {mostOrdered ? (
          <div className="text-lg font-bold text-purple-900">{mostOrdered.nome} <span className="text-sm font-normal text-purple-600">({mostOrdered.quantidade}x)</span></div>
        ) : (
          <div className="text-sm text-purple-600">Nenhum pedido ainda</div>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
        <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)} className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939] focus:border-transparent transition-all" required>
          <option value="">-- Selecione uma categoria --</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id.toString()}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <input placeholder="Nome do prato" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939] focus:border-transparent transition-all" required />
        <input placeholder="Preço (ex: 10.50 ou R$ 10,50)" value={preco} onChange={(e) => setPreco(e.target.value)} className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939] focus:border-transparent transition-all" required />
        <input placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939] focus:border-transparent transition-all" />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2.5 bg-[#1e2939] hover:bg-[#16202a] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all">+ Adicionar Prato</button>
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
    <form onSubmit={handleCreate} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Categoria</label>
        <input placeholder="Ex: Sobremesas, Bebidas..." value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 border-gray-300 px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all" required />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all">+ Criar Categoria</button>
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
  const itemsPerPage = 5;

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

  function getPriceValue(preco: any): number {
    if (typeof preco === 'number') return preco;
    if (typeof preco === 'string') {
      const cleaned = preco.replace(/[^0-9.,]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  // Aplicar filtros
  const filteredPratos = pratos.filter((prato) => {
    // Filtro de busca por nome
    if (searchTerm && !prato.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro de categoria
    if (selectedCategory && prato.categoriaId.toString() !== selectedCategory) {
      return false;
    }

    // Filtro de preço mínimo
    if (minPrice) {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal) && getPriceValue(prato.preco) < minVal) {
        return false;
      }
    }

    // Filtro de preço máximo
    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal) && getPriceValue(prato.preco) > maxVal) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredPratos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPratos = filteredPratos.slice(startIndex, startIndex + itemsPerPage);

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  if (loading) {
    return <div className="text-center py-4">Carregando pratos...</div>;
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Buscar por nome</label>
            <input
              type="text"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Preço mínimo</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 5.00"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Preço máximo</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 50.00"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
            />
          </div>
        </div>

        {(searchTerm || selectedCategory || minPrice || maxPrice) && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredPratos.length} prato{filteredPratos.length !== 1 ? 's' : ''} encontrado{filteredPratos.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

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
          <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Dashboard Admin</h1>
              <p className="text-gray-600 text-lg">Gerencie seu cardápio e acompanhe os pedidos em tempo real</p>
            </div>

            <nav className="flex flex-wrap items-center gap-3">
              <a href="/" className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Cardápio
              </a>
              <a href="/orders" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pedidos
              </a>
              <button onClick={handleLogout} className="px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </nav>
          </header>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Categorias</h3>
              </div>
              <CategoriesTable />
            </div>

            <div className="p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Pedidos Recentes</h3>
              </div>
              <OrdersList />
            </div>
          </div>

          <div className="mb-8 p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Todos os Pratos</h3>
            </div>
            <DishesTable />
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#1e2939]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Novos Itens
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur rounded-2xl shadow-lg border-2 border-gray-200 hover:border-[#1e2939] transition-colors">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Adicionar Prato</h4>
                <AddMenuItemForm />
              </div>
              <div className="p-7 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur rounded-2xl shadow-lg border-2 border-gray-200 hover:border-green-600 transition-colors">
                <h4 className="font-bold text-lg mb-4 text-gray-900">Criar Categoria</h4>
                <CreateCategoryForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
