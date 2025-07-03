import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriasList from "../components/CategoriasList";
import GraniteBackground from "../components/GraniteBackground";

// cor (#1e2939) para destaques

export default function Home() {
  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
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
        <CategoriasList />
        <p className="text-sm mb-3 text-gray-600">
          Desenvolvido por{" "}
          <a
            href="https://www.instagram.com/vinicius_pascoal_q/?next=%2F"
            className="text-blue-500 hover:underline"
          >
            Vinicius Pascoal
          </a>
        </p>
      </main>
    </GraniteBackground>
  );
}
