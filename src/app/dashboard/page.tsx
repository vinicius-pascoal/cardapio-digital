"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("auth_token");
    if (!t) {
      router.replace("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    router.push("/login");
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-28 h-28 mb-4 mt-10"
          priority
        />
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="w-4/5 mb-6 border-gray-800 border-b-2 border-solid" />
        <div className="w-full max-w-3xl px-4">
          <p className="mb-4">Área administrativa simulada.</p>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
            <a href="/" className="px-3 py-2 border rounded">Ver cardápio</a>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
