"use client";

import { useState } from "react";
import Image from "next/image";
import setaDireita from "../img/setDir.svg";
import setaBaixo from "../img/setBaix.svg";

interface CategoriaComponentProps {
  ativo?: boolean;
}

export default function CategoriaComponet({
  ativo = false,
}: CategoriaComponentProps) {
  const [isAtivo, setIsAtivo] = useState(ativo);

  const toggleAtivo = () => {
    setIsAtivo((prev) => !prev);
  };

  return (
    <div className="cursor-pointer w-10/12">
      <div
        className="flex justify-between items-center mb-4 mr-32"
        onClick={toggleAtivo}
      >
        <Image
          src={isAtivo ? setaBaixo : setaDireita}
          alt="Seta de categoria"
          className="w-6 h-6"
        />
        <h2 className="text-xl font-bold ml-2">Entradas</h2>
      </div>
      {isAtivo && (
        <ul className="list-none p-0">
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Salada Caesar</span>
            <span className="text-gray-600">R$ 25,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Bruschetta de Tomate</span>
            <span className="text-gray-600">R$ 20,00</span>
          </li>
          <li className="flex justify-between items-center mb-4">
            <span>Carpaccio de Carne</span>
            <span className="text-gray-600">R$ 30,00</span>
          </li>
        </ul>
      )}
    </div>
  );
}
