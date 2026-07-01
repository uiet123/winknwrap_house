import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wick n Wrap House | Premium Candles & Hampers",
  description: "Discover our exclusive collection of scented candles, return favours, and customized gifting hampers for special occasions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          <Header />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
