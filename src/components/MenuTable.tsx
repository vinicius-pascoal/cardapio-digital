"use client";

import React, { useEffect, useMemo, useState } from "react";
import { swalError, swalSuccess, swalConfirm } from "../lib/swal";
import { categoriesAPI, dishesAPI, type Categoria, type Prato } from "../lib/api";

type MenuItem = {
  nome: string;
  preco?: string;
  descricao?: string;
};

type Category = {
  nome: string;
  ativo?: boolean;
  itens: MenuItem[];
};

export default function MenuTable(): React.ReactElement {
  const [menu, setMenu] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [sortPriceAsc, setSortPriceAsc] = useState<boolean | null>(null);

  useEffect(() => {
    load();
    function onUpdated() {
      load();
    }
    window.addEventListener("menu-updated", onUpdated);
    return () => window.removeEventListener("menu-updated", onUpdated);
  }, []);

  async function load() {
    try {
      // Buscar da API
      const [categoriasData, pratosData] = await Promise.all([
        categoriesAPI.list(),
        dishesAPI.list(),
      ]);

      // Agrupar pratos por categoria
      const menuFormatted = categoriasData.map((cat: Categoria) => {
        const pratosDaCategoria = pratosData
          .filter((p: Prato) => p.categoriaId === cat.id)
          .map((p: Prato) => {
            const preco = p.preco as any;
            let precoFormatado: string;

            if (typeof preco === 'number') {
              precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
            } else if (typeof preco === 'string') {
              precoFormatado = preco.startsWith('R$') ? preco : `R$ ${preco}`;
            } else {
              precoFormatado = 'R$ 0,00';
            }

            return {
              nome: p.nome,
              preco: precoFormatado,
              descricao: p.descricao || '',
            };
          });

        return {
          nome: cat.nome,
          ativo: true,
          itens: pratosDaCategoria,
        };
      });

      setMenu(menuFormatted);
    } catch (err) {
      console.error('Erro ao carregar menu da API:', err);
      // Fallback para localStorage
      try {
        const raw = localStorage.getItem("menu_categorias");
        const arr = raw ? JSON.parse(raw) : [];
        setMenu(arr);
      } catch (e) {
        setMenu([]);
      }
    }
  }

  async function removeItem(categoryName: string, index: number) {
    const res = await swalConfirm("Remover item", "Remover item do cardápio?");
    if (!res.isConfirmed) return;
    try {
      const raw = localStorage.getItem("menu_categorias");
      const arr: Category[] = raw ? JSON.parse(raw) : [];
      const cat = arr.find((c) => c.nome === categoryName);
      if (!cat) return;
      cat.itens.splice(index, 1);
      localStorage.setItem("menu_categorias", JSON.stringify(arr));
      window.dispatchEvent(new Event("menu-updated"));
      swalSuccess("Removido", "Item removido do cardápio");
    } catch (e) {
      console.error(e);
      swalError("Erro", "Erro ao remover item");
    }
  }

  const categories = useMemo(() => menu.map((c) => c.nome), [menu]);

  const rows = useMemo(() => {
    const out: ({ categoria: string } & MenuItem)[] = [];
    for (const c of menu) {
      for (const it of c.itens || []) {
        out.push({ categoria: c.nome, ...it });
      }
    }

    const filtered = out.filter((r) => {
      const q = query.trim().toLowerCase();
      if (filterCategoria && r.categoria !== filterCategoria) return false;
      if (!q) return true;
      return (
        (r.nome || "").toLowerCase().includes(q) ||
        (r.descricao || "").toLowerCase().includes(q) ||
        (r.categoria || "").toLowerCase().includes(q)
      );
    });

    if (sortPriceAsc !== null) {
      filtered.sort((a, b) => {
        const pa = parseFloat((a.preco || "").replace(/[^0-9,.-]/g, "").replace(/,/g, ".")) || 0;
        const pb = parseFloat((b.preco || "").replace(/[^0-9,.-]/g, "").replace(/,/g, ".")) || 0;
        return sortPriceAsc ? pa - pb : pb - pa;
      });
    }

    return filtered;
  }, [menu, query, filterCategoria, sortPriceAsc]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <input
          placeholder="Pesquisar nome, descrição ou categoria..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} className="w-full border px-4 py-2 rounded">
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-3">
          <button type="button" onClick={() => setSortPriceAsc(true)} className={`px-3 py-2 border rounded ${sortPriceAsc === true ? "bg-[#1e2939] text-white" : ""}`}>Preço ↑</button>
          <button type="button" onClick={() => setSortPriceAsc(false)} className={`px-3 py-2 border rounded ${sortPriceAsc === false ? "bg-[#1e2939] text-white" : ""}`}>Preço ↓</button>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => { setSortPriceAsc(null); setQuery(""); setFilterCategoria(""); }} className="px-3 py-2 border rounded">Limpar</button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-600">Nenhum item encontrado</td></tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.categoria}-${r.nome}-${idx}`} className="border-t">
                  <td className="px-4 py-4 align-top min-w-[180px]">{r.nome}</td>
                  <td className="px-4 py-4 align-top w-40">{r.categoria}</td>
                  <td className="px-4 py-4 align-top text-gray-700">{r.descricao}</td>
                  <td className="px-4 py-4 align-top w-32">{r.preco}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => {
                        const cat = menu.find((c) => c.nome === r.categoria);
                        if (!cat) return;
                        const indexInCat = cat.itens.findIndex((it) => it.nome === r.nome && it.descricao === r.descricao && it.preco === r.preco);
                        if (indexInCat === -1) return removeItem(r.categoria, 0);
                        removeItem(r.categoria, indexInCat);
                      }} className="px-3 py-2 bg-red-600 text-white rounded">Remover</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
