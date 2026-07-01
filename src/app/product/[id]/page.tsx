"use client";

import { use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";
import Link from "next/link";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const product = products.find(p => p.id === unwrappedParams.id);

  if (!product) {
    return notFound();
  }

  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find(c => c.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <main className={styles.main}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link> / <span>{product.title}</span>
        </div>
        
        <div className={styles.productGrid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <Image 
                src={product.img} 
                alt={product.title} 
                fill 
                className={styles.productImage} 
                priority
              />
            </div>
          </div>
          
          <div className={styles.infoColumn}>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.price}>{product.price}</p>
            
            <div className={styles.description}>
              <p>{product.description}</p>
              <ul>
                <li>100% Premium Soy Wax</li>
                <li>Hand-poured with love</li>
                <li>Eco-friendly and sustainable</li>
              </ul>
            </div>

            <div className={styles.actionArea}>
              {quantity === 0 ? (
                <button 
                  className={styles.addToCartBtn} 
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              ) : (
                <div className={styles.quantityControls}>
                  <button onClick={() => updateQuantity(product.title, -1)} aria-label="Decrease quantity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => updateQuantity(product.title, 1)} aria-label="Increase quantity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.guarantee}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Secure checkout. Crafted to perfection.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
