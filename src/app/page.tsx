import Image from "next/image";

import logo from "../img/logo.svg";
import CategoriasList from "../components/CategoriasList";
import CartButton from "../components/CartButton";
import GraniteBackground from "../components/GraniteBackground";

// cor (#1e2939) para destaques

export default function Home() {
  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
        <CartButton />
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-3xs h-3xs"
          priority
        />
        <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        <CategoriasList />
      </main>
    </GraniteBackground>
  );
}
