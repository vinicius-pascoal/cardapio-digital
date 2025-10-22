"use client";

import { useEffect, useState } from "react";
import CategoriaComponet from "./CategoriaComponet";
import { categoriesAPI, dishesAPI, type Categoria, type Prato } from "../lib/api";

export default function CategoriasList() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFromAPI() {
      try {
        setLoading(true);
        setError(null);

        // Buscar categorias e pratos da API
        const [categoriasData, pratosData] = await Promise.all([
          categoriesAPI.list(),
          dishesAPI.list(),
        ]);

        // Agrupar pratos por categoria
        const categoriasComPratos = categoriasData.map((cat: Categoria) => {
          const pratosDaCategoria = pratosData
            .filter((p: Prato) => p.categoriaId === cat.id)
            .map((p: Prato) => {
              // Tratar preço que pode vir como string ou número
              let precoFormatado: string;
              const preco = p.preco as any; // Flexibilizar tipo para lidar com variações

              if (typeof preco === 'number') {
                precoFormatado = `R$ ${preco.toFixed(2).replace('.', ',')}`;
              } else if (typeof preco === 'string') {
                // Se já vier formatado, usar direto
                precoFormatado = preco.startsWith('R$') ? preco : `R$ ${preco}`;
              } else {
                precoFormatado = 'R$ 0,00';
              }

              return {
                id: p.id,
                nome: p.nome,
                preco: precoFormatado,
                descricao: p.descricao || '',
              };
            });

          return {
            id: cat.id,
            nome: cat.nome,
            ativo: true, // Todas categorias da API são consideradas ativas
            itens: pratosDaCategoria,
          };
        });

        setCategorias(categoriasComPratos);
      } catch (err) {
        console.error('Erro ao carregar do backend:', err);
        setError('Erro ao carregar cardápio. Usando dados locais.');

        // Fallback para localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    }

    function loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem("menu_categorias");
        if (raw) {
          setCategorias(JSON.parse(raw));
          return;
        }
      } catch { }

      // fallback hardcoded
      setCategorias([
        {
          ativo: true,
          nome: "Entradas",
          itens: [
            { nome: "Salada Caesar", preco: "R$ 25,00", descricao: "Alface, croutons e molho Caesar" },
            { nome: "Bruschetta", preco: "R$ 15,00", descricao: "Pão italiano com tomate e manjericão" },
            { nome: "Batata Frita", preco: "R$ 10,00", descricao: "Batatas fritas crocantes" },
          ],
        },
        {
          ativo: true,
          nome: "Prato Principal",
          itens: [
            { nome: "Bife à Parmegiana", preco: "R$ 35,00", descricao: "Bife empanado com queijo e molho de tomate" },
            { nome: "Frango Grelhado", preco: "R$ 30,00", descricao: "Frango grelhado com ervas finas" },
          ],
        },
        {
          ativo: false,
          nome: "Sobremesas",
          itens: [
            { nome: "Torta de Limão", preco: "R$ 12,00", descricao: "Torta de limão com merengue" },
            { nome: "Pudim", preco: "R$ 8,00", descricao: "Pudim de leite condensado" },
          ],
        },
        {
          ativo: false,
          nome: "Bebidas",
          itens: [
            { nome: "Refrigerante", preco: "R$ 5,00", descricao: "Refrigerante de cola" },
            { nome: "Suco Natural", preco: "R$ 7,00", descricao: "Suco de laranja natural" },
            { nome: "Cerveja Artesanal", preco: "R$ 12,00", descricao: "Cerveja artesanal local" },
          ],
        },
      ]);
    }

    loadFromAPI();

    window.addEventListener("menu-updated", loadFromAPI);
    return () => window.removeEventListener("menu-updated", loadFromAPI);
  }, []);

  return (
    <div className="w-full">
      {loading && (
        <div className="text-center py-8 text-gray-600">
          Carregando cardápio...
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-orange-600 text-sm">
          {error}
        </div>
      )}
      {!loading && categorias.map((categoria, index) => (
        <div className="w-full flex flex-col items-center align-middle" key={categoria.id || index}>
          <CategoriaComponet ativo={categoria.ativo} key={categoria.id || index} nomeCategoria={categoria.nome} itens={categoria.itens} />
          <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        </div>
      ))}
    </div>
  );
}
