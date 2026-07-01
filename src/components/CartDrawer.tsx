"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import styles from "@/app/page.module.css";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, handleWhatsAppCheckout } = useCart();

  return (
    <>
      <div className={`${styles.cartOverlay} ${isCartOpen ? styles.cartOverlayOpen : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`${styles.cartDrawer} ${isCartOpen ? styles.cartDrawerOpen : ''}`}>
        <div className={styles.cartHeader}>
          <h3>Your Order</h3>
          <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>Your cart is empty.</div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className={styles.cartItem}>
                <div className={styles.cartItemImage}>
                  <Image src={item.img} alt={item.title} fill className={styles.cartImg} />
                </div>
                <div className={styles.cartItemDetails}>
                  <h4>{item.title}</h4>
                  <p>₹{item.priceNumeric}</p>
                  <div className={styles.cartItemControls}>
                    <button onClick={(e) => { e.preventDefault(); updateQuantity(item.title, -1); }} aria-label="Decrease quantity">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={(e) => { e.preventDefault(); updateQuantity(item.title, 1); }} aria-label="Increase quantity">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.title)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.cartTotal}>
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleWhatsAppCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
