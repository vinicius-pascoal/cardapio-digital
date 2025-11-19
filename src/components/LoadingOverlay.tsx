"use client";

import Image from "next/image";
import logo from "../img/logo.svg";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-bounce">
          <Image
            src={logo}
            alt="Carregando..."
            className="w-24 h-24 sm:w-32 sm:h-32"
            priority
          />
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-white font-medium text-lg">Carregando...</p>
      </div>
    </div>
  );
}
