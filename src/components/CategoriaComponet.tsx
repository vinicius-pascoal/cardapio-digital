"use client";

import { useState } from "react";
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
            <li key={index} className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span>{item.nome}</span>
                <span className="text-gray-500 text-sm ml-2">
                  ({item.descricao || "Sem descrição"})
                </span>
              </div>
              <span className="text-gray-600 ">{item.preco}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
