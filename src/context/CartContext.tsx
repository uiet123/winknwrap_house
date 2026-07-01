"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  priceNumeric: number;
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (title: string, delta: number) => void;
  removeFromCart: (title: string) => void;
  cartTotal: number;
  handleWhatsAppCheckout: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      const priceNumeric = parseInt(product.price.replace('₹', ''));
      return [...prev, { ...product, quantity: 1, priceNumeric }];
    });
  };

  const updateQuantity = (title: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.title === title) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (title: string) => {
    setCart(prev => prev.filter(item => item.title !== title));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.priceNumeric * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "+917973270451"; 
    let msg = "Hello Wick n Wrap House, I would like to place an order:\n\n";
    cart.forEach(item => {
      msg += `- ${item.quantity}x ${item.title} (₹${item.priceNumeric * item.quantity})\n`;
    });
    msg += `\n*Total: ₹${cartTotal}*\n\nPlease confirm my order.`;
    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      cartTotal,
      handleWhatsAppCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
