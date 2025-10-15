import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriasList from "../components/CategoriasList";
import GraniteBackground from "../components/GraniteBackground";

// cor (#1e2939) para destaques

export default function Home() {
  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
        {/* Carrinho fixo no canto superior direito */}
        <a
          href="#"
          className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-black/80 p-2 rounded-full shadow-lg"
          aria-label="Ver carrinho"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6M17 13l1.2 6M6 19a1 1 0 11-2 0 1 1 0 012 0zm13 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </a>
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
      </main>
    </GraniteBackground>
  );
}
