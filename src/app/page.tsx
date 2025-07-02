import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriaComponet from "../components/CategoriaComponet";

import GraniteBackground from "../components/GraniteBackground";
// cor (#1e2939) para destaques

export default function Home() {
  let ativo = false;

  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen text-gray-800">
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-32 h-32 mb-6 mt-10"
          priority
        />
        <h1 className="text-2xl font-bold mb-4 ">
          Bem-vindo ao Cardápio Digital
        </h1>
        <div className="w-4/5 h-1 bg-gray-800 mb-8"></div>
          <CategoriaComponet />
      </main>
    </GraniteBackground>
  );
}
