"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";
import MenuTable from "../../components/MenuTable";
import { swalError, swalSuccess, swalConfirm } from "../../lib/swal";
import { categoriesAPI, dishesAPI, ordersAPI, type Categoria, type Prato, type Pedido } from "../../lib/api";
import { useLoading } from "../../components/LoadingProvider";

function StatsCards() {
  const [ordersToday, setOrdersToday] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [mostOrdered, setMostOrdered] = useState<{ nome: string; quantidade: number } | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        // Buscar pedidos da API
        const orders = await ordersAPI.list();

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let todayCount = 0;
        let monthCount = 0;
        let revenue = 0;
        const dishCounts: Record<string, number> = {};

        for (const o of orders) {
          const d = new Date(o.criadoEm || o.createdAt || '');
          if (d >= startOfToday) todayCount++;
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) monthCount++;

          // Calcular receita usando o campo 'total' da API
          if (o.total !== undefined && o.total !== null) {
            if (typeof o.total === 'number') {
              revenue += o.total;
            } else if (typeof o.total === 'string') {
              const cleanTotal = String(o.total).replace(/[^\d.,]/g, '').replace(',', '.');
              const numTotal = parseFloat(cleanTotal);
              if (!isNaN(numTotal)) {
                revenue += numTotal;
              }
            }
          } else {
            // Calcular dos itens se não tiver total
            const items = o.itens || o.items || [];
            if (Array.isArray(items)) {
              for (const it of items) {
                const preco = it.prato?.preco || 0;
                const precoNum = typeof preco === 'number' ? preco : parseFloat(String(preco).replace(/[^\d.,]/g, '').replace(',', '.'));
                if (!isNaN(precoNum)) {
                  revenue += precoNum * (it.quantidade || 1);
                }
              }
            }
          }

          // Contar pratos mais pedidos
          const items = o.itens || o.items || [];
          if (Array.isArray(items)) {
            for (const it of items) {
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
        setTotalRevenue(revenue);
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
        let revenue = 0;
        const dishCounts: Record<string, number> = {};

        for (const o of orders) {
          const d = new Date(o.criadoEm || o.createdAt);
          if (d >= startOfToday) todayCount++;
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) monthCount++;

          // Calcular receita usando o campo 'total' da API
          if (o.total !== undefined && o.total !== null) {
            if (typeof o.total === 'number') {
              revenue += o.total;
            } else if (typeof o.total === 'string') {
              const cleanTotal = String(o.total).replace(/[^\d.,]/g, '').replace(',', '.');
              const numTotal = parseFloat(cleanTotal);
              if (!isNaN(numTotal)) {
                revenue += numTotal;
              }
            }
          } else {
            // Calcular dos itens se não tiver total
            const items = o.itens || o.items || [];
            if (Array.isArray(items)) {
              for (const it of items) {
                const preco = it.prato?.preco || 0;
                const precoNum = typeof preco === 'number' ? preco : parseFloat(String(preco).replace(/[^\d.,]/g, '').replace(',', '.'));
                if (!isNaN(precoNum)) {
                  revenue += precoNum * (it.quantidade || 1);
                }
              }
            }
          }

          // Contar pratos mais pedidos
          const items = o.itens || o.items || [];
          if (Array.isArray(items)) {
            for (const it of items) {
              const name = it.prato?.nome || "Desconhecido";
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
        setTotalRevenue(revenue);
      } catch (e) {
        setOrdersToday(0);
        setOrdersThisMonth(0);
        setMostOrdered(null);
        setTotalRevenue(0);
      }
    }

    loadStats();
    window.addEventListener("orders-updated", loadStats);
    return () => window.removeEventListener("orders-updated", loadStats);
  }, []);

  return (
    <div className="w-full mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/80 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-emerald-700">Receita Total</div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-900">R$ {totalRevenue.toFixed(2)}</div>
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
  const { withLoading } = useLoading();
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
      await withLoading(dishesAPI.create({
        nome,
        descricao: descricao || undefined,
        preco: precoNumerico,
        categoriaId: categoria.id,
      }));

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
  const { withLoading } = useLoading();
  const [nome, setNome] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      swalError("Campo vazio", "Informe o nome da categoria");
      return;
    }
    try {
      // Criar categoria via API
      const novaCategoria = await withLoading(categoriesAPI.create({ nome: nome.trim() }));

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

        // Transformar para o formato esperado, mapeando campos do backend
        const transformedOrders = ordersData.map((o: any) => {
          // Usar campos da API: 'itens' e 'criadoEm'
          const items = (o.itens || o.items || []).map((it: any) => {
            const prato = it.prato || {};
            return {
              nome: prato.nome || "Desconhecido",
              quantidade: it.quantidade,
            };
          });

          // API retorna 'total' já calculado
          const total = o.total;

          return {
            id: o.id,
            criadoEm: o.criadoEm || o.createdAt || new Date().toISOString(),
            items,
            total: typeof total === 'number'
              ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : total,
          };
        });

        // Ordenar por data de criação: mais recentes primeiro
        const sortedOrders = transformedOrders.sort((a, b) => {
          const dateA = new Date(a.criadoEm).getTime();
          const dateB = new Date(b.criadoEm).getTime();
          return dateB - dateA;
        });

        // Limitar aos 5 pedidos mais recentes
        setOrders(sortedOrders.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        // Fallback para localStorage
        try {
          const raw = localStorage.getItem("orders");
          const localOrders = raw ? JSON.parse(raw) : [];
          // Ordenar e limitar também no localStorage
          const sorted = localOrders.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          setOrders(sorted.slice(0, 5));
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
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-gray-500">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {orders.map((o) => (
            <div key={o.id} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Pedido #{o.id}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(o.criadoEm).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-green-100 rounded-lg">
                  <span className="font-bold text-green-700">{o.total}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Itens:
                </div>
                <ul className="space-y-1">
                  {o.items && o.items.map((it: any, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2 pl-5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                      <span className="font-medium">{it.nome}</span>
                      <span className="text-gray-500">×</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold">{it.quantidade}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}

function CategoriesTable() {
  const { withLoading } = useLoading();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
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

  function startEdit(cat: Categoria) {
    setEditingId(cat.id);
    setEditName(cat.nome);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) {
      swalError("Erro", "O nome da categoria não pode estar vazio");
      return;
    }

    try {
      await withLoading(categoriesAPI.update(id, { nome: editName.trim() }));
      window.dispatchEvent(new Event("menu-updated"));
      swalSuccess("Atualizada", "Categoria atualizada com sucesso");
      setEditingId(null);
      setEditName("");
    } catch (err: any) {
      console.error('Erro ao atualizar categoria:', err);
      swalError("Erro", err.message || "Erro ao atualizar categoria");
    }
  }

  async function handleDelete(id: number, nome: string) {
    const res = await swalConfirm("Remover categoria", `Remover a categoria "${nome}"? Todos os pratos desta categoria também serão removidos.`);
    if (!res.isConfirmed) return;

    try {
      await withLoading(categoriesAPI.delete(id));
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
                  <td className="px-4 py-2 font-medium">
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                        autoFocus
                      />
                    ) : (
                      cat.nome
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {editingId === cat.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.nome)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                        >
                          Remover
                        </button>
                      </div>
                    )}
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
  const { withLoading } = useLoading();
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

  // Estados para edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");

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

  function startEdit(prato: Prato) {
    setEditingId(prato.id);
    setEditNome(prato.nome);
    setEditDescricao(prato.descricao || "");
    setEditPreco(prato.preco.toString());
    setEditCategoriaId(prato.categoriaId.toString());
  }

  function cancelEdit() {
    setEditingId(null);
    setEditNome("");
    setEditDescricao("");
    setEditPreco("");
    setEditCategoriaId("");
  }

  async function saveEdit(id: number) {
    if (!editNome.trim()) {
      swalError("Erro", "O nome do prato não pode estar vazio");
      return;
    }

    const precoNum = parseFloat(editPreco);
    if (isNaN(precoNum) || precoNum <= 0) {
      swalError("Erro", "Digite um preço válido maior que zero");
      return;
    }

    if (!editCategoriaId) {
      swalError("Erro", "Selecione uma categoria");
      return;
    }

    try {
      await withLoading(dishesAPI.update(id, {
        nome: editNome.trim(),
        descricao: editDescricao.trim() || undefined,
        preco: precoNum,
        categoriaId: parseInt(editCategoriaId),
      }));
      window.dispatchEvent(new Event("menu-updated"));
      swalSuccess("Atualizado", "Prato atualizado com sucesso");
      cancelEdit();
    } catch (err: any) {
      console.error('Erro ao atualizar prato:', err);
      swalError("Erro", err.message || "Erro ao atualizar prato");
    }
  }

  async function handleDelete(id: number, nome: string) {
    const res = await swalConfirm("Remover prato", `Remover o prato "${nome}"?`);
    if (!res.isConfirmed) return;

    try {
      await withLoading(dishesAPI.delete(id));
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
              min="0"
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
              min="0"
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
                editingId === prato.id ? (
                  <tr key={prato.id} className="border-b bg-blue-50">
                    <td className="px-4 py-2">{prato.id}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                        placeholder="Nome do prato"
                      />
                      <input
                        type="text"
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded text-sm mt-1"
                        placeholder="Descrição (opcional)"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={editCategoriaId}
                        onChange={(e) => setEditCategoriaId(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                      >
                        <option value="">Selecione...</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editPreco}
                        onChange={(e) => setEditPreco(e.target.value)}
                        className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
                        placeholder="Preço"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => saveEdit(prato.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded w-full"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded w-full"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={prato.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{prato.id}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{prato.nome}</div>
                      {prato.descricao && (
                        <div className="text-xs text-gray-500 mt-1">{prato.descricao}</div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{getCategoriaNome(prato.categoriaId)}</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatPrice(prato.preco)}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(prato)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(prato.id, prato.nome)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                )
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
              <a href="/analytics" className="px-5 py-2.5 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Análise
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
