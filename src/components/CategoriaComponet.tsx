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
    <div className="cursor-pointer w-4/5  p-4 mb-6">
      <div
        className="flex justify-between items-center mb-4 "
        onClick={toggleAtivo}
      >
        <Image
          src={isAtivo ? setaBaixo : setaDireita}
          alt="Seta de categoria"
          className="w-6 h-6"
        />
        <h2 className="text-xl font-bold ">{nomeCategoria}</h2>
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

function ItemRow({ item }: { item: { nome: string; preco: string; descricao?: string } }) {
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
    addItem({ nome: item.nome, preco: item.preco });
  }

  return (
    <li className="flex justify-between items-center mb-4">
      <div className="flex flex-col">
        <span>{item.nome}</span>
        <span className="text-gray-500 text-sm ml-2">({item.descricao || "Sem descrição"})</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gray-600 ">{item.preco}</span>
        <button onClick={handleAdd} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Adicionar</button>
      </div>
    </li>
  );
}
