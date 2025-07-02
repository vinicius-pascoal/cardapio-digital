import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriaComponet from "../components/CategoriaComponet";

import GraniteBackground from "../components/GraniteBackground";
// cor (#1e2939) para destaques

export default function Home() {
  let ativo = false;

  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-scroll text-gray-800">
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-32 h-32 mb-6 mt-10"
          priority
        />
        <h1 className="text-2xl font-bold mb-4 ">
          Bem-vindo ao Cardápio Digital
        </h1>
        <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        <CategoriaComponet ativo />
        <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        <CategoriaComponet />
        <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        <CategoriaComponet />
        <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />

        <p className="text-sm text-gray-600">
          Desenvolvido por 
          <a
            href="https://github.com/vinicius-pascoal"
            className="text-blue-500 hover:underline"
          >
            Vinicius Pascoal
          </a>
        </p>
      </main>
    </GraniteBackground>
  );
}
