"use client";

import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count, setOpen } = useCart();

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 bg-white/90 p-2 sm:p-2.5 rounded-full shadow-md flex items-center justify-center border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1e2939]/30"
      aria-label="Ver carrinho"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#1e2939]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6M17 13l1.2 6M6 19a1 1 0 11-2 0 1 1 0 012 0zm13 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
      {count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center bg-[#1e2939] text-white rounded-full text-xs w-5 h-5 font-medium">{count}</span>
      )}
    </button>
  );
}
