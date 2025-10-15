"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // se já estiver autenticado, redireciona para dashboard
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("auth_token");
      if (t) router.replace("/dashboard");
    }
  }, [router]);

  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // credenciais mock: admin / admin12345
    setTimeout(() => {
      if (username === "admin" && password === "admin12345") {
        localStorage.setItem("auth_token", "logged");
        setLoading(false);
        router.push("/dashboard");
      } else {
        setLoading(false);
        setError("Usuário ou senha inválidos");
      }
    }, 600);
  }

  return (
    <GraniteBackground>
      <main className="flex flex-col items-center h-screen overflow-y-scroll overflow-x-hidden text-gray-800">
        <Image
          src={logo}
          alt="Logo do Cardápio Digital"
          className="w-28 h-28 mb-4 mt-10"
          priority
        />
        <h2 className="text-2xl font-bold mb-4">Entrar</h2>
        <div className="w-4/5 mb-6 border-gray-800 border-b-2 border-solid" />
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 px-4">
          <div>
            <label className="block text-sm mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <a href="/" className="text-sm text-gray-600 hover:underline">
              Voltar ao Cardápio
            </a>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </main>
    </GraniteBackground>
  );
}
