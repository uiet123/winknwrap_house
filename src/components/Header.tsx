"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "@/app/page.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo/540349204_17844998094558720_3448244895683446768_n.jpg" 
            alt="Wick n Wrap House Logo" 
            width={50} height={50} 
            quality={100}
            unoptimized={true}
            className={styles.logoImage} 
          />
          <span className={styles.logoTextDesktop}>Wick n Wrap House</span>
          <span className={styles.logoTextMobile}>
            <span className={styles.logoTextTop}>WICK N WRAP</span>
            <span className={styles.logoTextBottom}>HOUSE</span>
          </span>
        </Link>
        <div className={styles.navGroup}>
          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/#collection" onClick={() => setIsMenuOpen(false)}>Collection</Link>
            <Link href="/#reviews" onClick={() => setIsMenuOpen(false)}>Testimonials</Link>
            <Link href="/#contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          </nav>

          <div className={styles.headerActions}>
            <button 
              className={styles.cartIconBtn} 
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                <span className={styles.cartBadge}>
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            <button 
              className={`${styles.burgerBtn} ${isMenuOpen ? styles.open : ''}`} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
