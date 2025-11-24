"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import logo from "../../img/logo.svg";
import GraniteBackground from "../../components/GraniteBackground";
import { swalSuccess, swalError } from "../../lib/swal";

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
      try {
        if (username === "admin" && password === "admin12345") {
          localStorage.setItem("auth_token", "logged");
          setLoading(false);
          // feedback e redirecionamento
          try {
            swalSuccess("Logado", "Você foi autenticado com sucesso").then(() => {
              router.replace("/dashboard");
            });
          } catch {
            router.replace("/dashboard");
          }
        } else {
          setLoading(false);
          setError("Usuário ou senha inválidos");
        }
      } catch (e) {
        setLoading(false);
        setError("Erro ao autenticar");
      }
    }, 600);
  }

  return (
    <GraniteBackground>
      <main className="flex items-center justify-center min-h-screen px-4 text-gray-800">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-10 bg-white/60 backdrop-blur-md rounded-xl shadow-xl border border-gray-200">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <Image src={logo} alt="Logo do Cardápio Digital" className="w-48 h-48 mb-4" priority />
              <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta</h2>
            </div>

            <div className="w-full md:w-96">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e2939]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center bg-[#1e2939] hover:bg-[#16202a] text-white px-4 py-2 rounded-md shadow"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                  <a href="/" className="text-sm text-gray-600 hover:underline">Voltar ao Cardápio</a>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </main>
    </GraniteBackground>
  );
}
