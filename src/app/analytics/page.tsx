"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import GraniteBackground from "../../components/GraniteBackground";
import { ordersAPI } from "../../lib/api";

type ViewPeriod = "week" | "month";

export default function AnalyticsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("week");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const ordersData = await ordersAPI.list();
        setOrders(ordersData);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
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
  }, [router]);

  // Filtrar pedidos baseado no período
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const daysToSubtract = viewPeriod === "week" ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return orders.filter((o) => {
      const orderDate = new Date(o.criadoEm || o.createdAt);
      return orderDate >= startDate;
    });
  }, [orders, viewPeriod]);

  // Dados: Pedidos por hora do dia
  const ordersByHour = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }

    filteredOrders.forEach((o) => {
      const date = new Date(o.criadoEm || o.createdAt);
      const hour = date.getHours();
      hourCounts[hour]++;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hora: `${hour}h`,
      pedidos: count,
    }));
  }, [filteredOrders]);

  // Dados: Pedidos por dia da semana
  const ordersByDayOfWeek = useMemo(() => {
    const dayCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    filteredOrders.forEach((o) => {
      const date = new Date(o.criadoEm || o.createdAt);
      const day = date.getDay();
      dayCounts[day]++;
    });

    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return Object.entries(dayCounts).map(([day, count]) => ({
      dia: dayNames[parseInt(day)],
      pedidos: count,
    }));
  }, [filteredOrders]);

  // Dados: Receita por dia
  const revenueByDay = useMemo(() => {
    const dayRevenue: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      const date = new Date(o.criadoEm || o.createdAt);
      const dateKey = date.toLocaleDateString("pt-BR");

      // Calcular total baseado nos itens se não vier da API
      let orderTotal = 0;
      if (o.total && o.total > 0) {
        orderTotal = typeof o.total === "number" ? o.total : parseFloat(String(o.total).replace(/[R$\s]/g, "").replace(",", "."));
      } else {
        // Calcular pelos itens
        const items = o.itens || o.items || [];
        items.forEach((item: any) => {
          const preco = item.prato?.preco || 0;
          const quantidade = item.quantidade || 1;
          const precoNum = typeof preco === "number" ? preco : parseFloat(String(preco).replace(/[R$\s]/g, "").replace(",", "."));
          if (!isNaN(precoNum)) {
            orderTotal += precoNum * quantidade;
          }
        });
      }

      if (!isNaN(orderTotal) && orderTotal > 0) {
        dayRevenue[dateKey] = (dayRevenue[dateKey] || 0) + orderTotal;
      }
    });

    return Object.entries(dayRevenue)
      .map(([date, revenue]) => ({
        data: date,
        receita: revenue,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data.split("/").reverse().join("-"));
        const dateB = new Date(b.data.split("/").reverse().join("-"));
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredOrders]);

  // Dados: Pratos mais vendidos
  const topDishes = useMemo(() => {
    const dishCounts: Record<string, number> = {};

    filteredOrders.forEach((o) => {
      const items = o.itens || o.items || [];
      items.forEach((it: any) => {
        const name = it.prato?.nome || "Desconhecido";
        const quantity = it.quantidade || 1;
        dishCounts[name] = (dishCounts[name] || 0) + quantity;
      });
    });

    return Object.entries(dishCounts)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [filteredOrders]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    let totalRevenue = 0;

    filteredOrders.forEach((o) => {
      let orderTotal = 0;

      // Verificar se tem total na API
      if (o.total && o.total > 0) {
        if (typeof o.total === "number") {
          orderTotal = o.total;
        } else if (typeof o.total === "string") {
          const cleaned = o.total.replace(/[R$\s]/g, "").replace(",", ".");
          orderTotal = parseFloat(cleaned);
        }
      } else {
        // Calcular total baseado nos itens do pedido
        const items = o.itens || o.items || [];
        items.forEach((item: any) => {
          const preco = item.prato?.preco || 0;
          const quantidade = item.quantidade || 1;
          const precoNum = typeof preco === "number" ? preco : parseFloat(String(preco).replace(/[R$\s]/g, "").replace(",", "."));
          if (!isNaN(precoNum)) {
            orderTotal += precoNum * quantidade;
          }
        });
      }

      if (!isNaN(orderTotal) && orderTotal > 0) {
        totalRevenue += orderTotal;
      }
    });

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
    };
  }, [filteredOrders]);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  if (loading) {
    return (
      <GraniteBackground>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600 text-lg">Carregando dados...</p>
        </div>
      </GraniteBackground>
    );
  }

  return (
    <GraniteBackground>
      <main className="min-h-screen py-10 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Análise de Dados
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Dashboard
              </Link>
            </div>
          </header>

          {/* Filtro de período */}
          <div className="mb-8 flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">
              Período:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewPeriod("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewPeriod === "week"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Última Semana
              </button>
              <button
                onClick={() => setViewPeriod("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewPeriod === "month"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Último Mês
              </button>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-700">
                  Total de Pedidos
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-900">
                {stats.totalOrders}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm font-medium text-emerald-700">
                  Receita Total
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-900">
                R$ {stats.totalRevenue.toFixed(2).replace(".", ",")}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div className="text-sm font-medium text-purple-700">
                  Ticket Médio
                </div>
              </div>
              <div className="text-3xl font-extrabold text-purple-900">
                R$ {stats.avgOrderValue.toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pedidos por hora */}
            <div className="p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pedidos por Horário
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pedidos por dia da semana */}
            <div className="p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Pedidos por Dia da Semana
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByDayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Receita por dia */}
            <div className="p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                Receita por Dia
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pratos mais vendidos */}
            <div className="p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                Top 5 Pratos Mais Vendidos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topDishes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) =>
                      `${entry.nome}: ${entry.quantidade}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {topDishes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
