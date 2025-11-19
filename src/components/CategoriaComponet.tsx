"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import Image from "next/image";
import setaDireita from "../img/setDir.svg";
import setaBaixo from "../img/setBaix.svg";

interface CategoriaComponentProps {
  ativo?: boolean;
  nomeCategoria: string;
  itens: Array<{
    id?: number;
    nome: string;
    preco: string;
    descricao?: string;
  }>;
}

export default function CategoriaComponet({
  ativo = false,
  nomeCategoria,
  itens,
}: CategoriaComponentProps) {
  const [isAtivo, setIsAtivo] = useState(ativo);

  const toggleAtivo = () => {
    setIsAtivo((prev) => !prev);
  };

  return (
    <div className="cursor-pointer w-full sm:w-4/5 max-w-2xl p-4 sm:p-5 mb-4 sm:mb-6">
      <div
        className="flex justify-end items-center mb-3 sm:mb-4 gap-2"
        onClick={toggleAtivo}
      >
        {/* Seta ao lado do nome, nome alinhado à direita */}
        <Image
          src={isAtivo ? setaBaixo : setaDireita}
          alt="Seta de categoria"
          className="w-5 h-5 sm:w-6 sm:h-6"
        />
        <h2 className="text-lg sm:text-xl font-bold text-right">{nomeCategoria}</h2>
      </div>
      {isAtivo && (
        <ul className="">
          {itens.map((item, index) => (
            <ItemRow key={index} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemRow({ item }: { item: { id?: number; nome: string; preco: string; descricao?: string } }) {
  const { addItem } = useCart();

  function animateToCart(e: React.MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.transition = "transform 0.7s ease-in, opacity 0.7s ease-in";
    document.body.appendChild(clone);

    // destino aproximado (top-right)
    const destX = window.innerWidth - 40 - rect.left;
    const destY = -rect.top + 10 - rect.top;
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${destX}px, ${-rect.top - 10}px) scale(0.2)`;
      clone.style.opacity = "0.2";
    });

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 800);
  }

  function handleAdd(e: React.MouseEvent) {
    animateToCart(e);
    addItem({ id: item.id, nome: item.nome, preco: item.preco });
  }

  return (
    <li className="flex justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm sm:text-base font-medium">{item.nome}</span>
        <span className="text-gray-500 text-xs sm:text-sm mt-0.5">({item.descricao || "Sem descrição"})</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleAdd}
          className="text-[#1e2939] border border-[#1e2939] rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium hover:bg-[#1e2939]/10 transition focus:outline-none focus:ring-2 focus:ring-[#1e2939]/30 whitespace-nowrap"
        >
          {item.preco}
        </button>
      </div>
    </li>
  );
}
