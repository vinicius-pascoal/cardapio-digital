import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriasList from "../components/CategoriasList";
import CartButton from "../components/CartButton";
import GraniteBackground from "../components/GraniteBackground";

// cor (#1e2939) para destaques

export default function Home() {
  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800 px-4">
        <CartButton />
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mb-4 sm:mb-6 mt-6 sm:mt-10"
          priority
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-center px-2">
          Bem-vindo ao Cardápio Digital
        </h1>
        <div className="w-full max-w-2xl mb-6 sm:mb-8 border-gray-800 border-b-4 border-solid" />
        <CategoriasList />
      </main>
    </GraniteBackground>
  );
}
