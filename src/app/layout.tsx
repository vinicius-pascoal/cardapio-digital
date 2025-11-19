import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartProvider from "../components/CartProvider";
import CartModal from "../components/CartModal";
import NewOrderNotifier from "../components/NewOrderNotifier";
import { LoadingProvider } from "../components/LoadingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cardapio digital",
  description: "Cardapio digital label",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <CartProvider>
            <NewOrderNotifier />
            {children}
            <CartModal />
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
