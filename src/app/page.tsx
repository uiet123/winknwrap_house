"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import styles from "./page.module.css";

export default function Home() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else {
            entry.target.classList.remove("active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const heroImages = [
    '/products/Screenshot_20260701_174154_Instagram.jpg',
    '/products/Screenshot_20260701_174141_Instagram.jpg',
    '/products/Screenshot_20260701_174319_Instagram.jpg',
  ];

  const baseReviews = [
    '/reviews/Screenshot_20260701_174032_Instagram.jpg',
    '/reviews/Screenshot_20260701_174042_Instagram.jpg',
    '/reviews/Screenshot_20260701_174105_Instagram.jpg',
    '/reviews/Screenshot_20260701_174110_Instagram.jpg',
    '/reviews/Screenshot_20260701_174122_Instagram.jpg',
  ];
  const reviews = [...baseReviews, ...baseReviews, ...baseReviews]; 

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    handleWhatsAppCheckout 
  } = useCart();

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setFadeSplash(true);
      setTimeout(() => setShowSplash(false), 800);
    }, 1000);

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(splashTimer);
    };
  }, [heroImages.length]);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <main className={styles.main}>
      {/* Splash Screen */}
      {showSplash && (
        <div className={`${styles.splashScreen} ${fadeSplash ? styles.splashFadeOut : ''}`}>
          <div className={styles.splashLogoContainer}>
            <Image 
              src="/logo/540349204_17844998094558720_3448244895683446768_n.jpg" 
              alt="Wick n Wrap House Logo" 
              width={180} height={180} 
              quality={100}
              unoptimized={true}
              className={styles.splashLogoImage} 
            />
          </div>
        </div>
      )}

      {/* Fullscreen Cinematic Hero */}
      <motion.section 
        className={styles.hero}
        style={{ scale: heroScale, opacity: heroOpacity }}
      >
        <div className={styles.heroBg}>
          <div className={styles.heroOverlay}></div>
        </div>
        
        <div className={styles.heroContent}>
          <h1>Illuminate<br/>The Moment</h1>
          <p>Exquisite Scents & Luxury Gifting</p>
          <a href="#collection" className={`btn ${styles.btnGlow}`}>View Collection</a>
        </div>
      </motion.section>

      {/* Trust & Stats Section */}
      <motion.section 
        className={styles.statsSection}
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        whileInView={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <span>Our Commitment</span>
          <h2>Craftsmanship & Quality</h2>
        </div>

        <div className={styles.statsCards}>
          <div className={styles.premiumBadge}>
            <div className={styles.badgeIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            </div>
            <div className={styles.badgeText}>
              <span className={styles.badgeTitle}>Premium Quality</span>
              <span className={styles.badgeValue}>100% Hand-Poured</span>
            </div>
          </div>

          <div className={styles.premiumBadge}>
            <div className={styles.badgeIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 14 6c3.48 0 6 2.52 6 6 0 7.73-7.58 12-10 12-4.42 0-8-3.58-8-8a8 8 0 0 1 13-6"></path></svg>
            </div>
            <div className={styles.badgeText}>
              <span className={styles.badgeTitle}>Eco-Friendly</span>
              <span className={styles.badgeValue}>100% Soy Wax</span>
            </div>
          </div>

          <div className={styles.premiumBadge}>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
            </div>
            <div className={styles.badgeText}>
              <span className={styles.badgeTitle}>Customer Reviews</span>
              <span className={styles.badgeValue}>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Asymmetrical Collection Section */}
      <motion.section 
        id="collection" 
        className={styles.section}
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        whileInView={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.1 }}
      >
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`} ref={addToRefs}>
            <span>Our Craft</span>
            <h2>The Collection</h2>
          </div>

          <div className={styles.ecommerceGrid}>
            {products.map((item, i) => {
              const cartItem = cart.find(c => c.title === item.title);
              const quantity = cartItem ? cartItem.quantity : 0;
              return (
              <div key={item.id + i} className={`${styles.productCard} reveal`} ref={addToRefs} style={{ transitionDelay: `${(i % 4) * 0.15}s` }}>
                 <div className={`${styles.productImageWrap} img-wrap`}>
                   <Link href={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                     <Image 
                        src={item.img} 
                        alt={item.title} 
                        fill 
                        className={`${styles.productImage} img-parallax`} 
                     />
                   </Link>
                   <AnimatePresence mode="wait">
                     {quantity === 0 ? (
                         <motion.button 
                           key="addBtn"
                           initial={{ opacity: 0, scale: 0.5 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.5 }}
                           transition={{ duration: 0.2 }}
                           className={styles.addToCartBtn} 
                           aria-label="Add to Cart"
                           onClick={(e) => { e.preventDefault(); addToCart(item); }}
                           style={{ zIndex: 2 }}
                         >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <line x1="12" y1="5" x2="12" y2="19"></line>
                           <line x1="5" y1="12" x2="19" y2="12"></line>
                         </svg>
                       </motion.button>
                     ) : (
                       <motion.div 
                         key="controls"
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         transition={{ duration: 0.2 }}
                         className={styles.productCardCartControls} 
                         style={{ zIndex: 2 }}
                       >
                         <button onClick={(e) => { e.preventDefault(); updateQuantity(item.title, -1); }} aria-label="Decrease quantity">
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                         </button>
                         <span>{quantity}</span>
                         <button onClick={(e) => { e.preventDefault(); updateQuantity(item.title, 1); }} aria-label="Increase quantity">
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                         </button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
                 <div className={styles.productInfo}>
                    <h3>{item.title}</h3>
                    <p>{item.price}</p>
                 </div>
              </div>
            )})}
          </div>
        </div>
      </motion.section>

      {/* Infinite Marquee Reviews */}
      <motion.section 
        id="reviews" 
        className={styles.section} 
        style={{ padding: '0 0 10vw 0' }}
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        whileInView={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="container">
           <div className={`${styles.sectionHeader} reveal`} ref={addToRefs}>
              <span>Praise</span>
              <h2>Client Stories</h2>
           </div>
        </div>
        <div className={styles.reviewsContainer}>
          <div className={styles.reviewsTrack}>
            {reviews.map((img, i) => (
               <div key={i} className={styles.reviewItem}>
                  <Image src={img} alt={`Review ${i}`} fill className={styles.reviewImg} />
               </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact" 
        className={styles.section} 
        style={{ background: 'var(--background)', borderTop: '1px solid var(--accent)' }}
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        whileInView={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`} ref={addToRefs}>
            <span>Get in Touch</span>
            <h2>Contact Us</h2>
          </div>
          
          <div className={styles.contactWrapper}>
            <div className={`${styles.contactInfo} reveal`} ref={addToRefs}>
              <h3>Let's Create Magic</h3>
              <p>Have a custom order in mind? Want to inquire about bulk gifting? We'd love to hear from you.</p>
              
              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <strong>Email</strong>
                  <span>princeuiet123@gmail.com</span>
                </div>
                <div className={styles.contactItem}>
                  <strong>Instagram</strong>
                  <span>@wicknwrap_house</span>
                </div>
              </div>
            </div>
            
            <form 
              action="https://formsubmit.co/princeuiet123@gmail.com" 
              method="POST" 
              className={`${styles.contactForm} reveal`} 
              ref={addToRefs}
            >
              <input type="hidden" name="_captcha" value="false" />
              <div className={styles.formGroup}>
                <input type="text" name="name" placeholder="Your Name" required className={styles.inputField} />
              </div>
              <div className={styles.formGroup}>
                <input type="email" name="email" placeholder="Your Email" required className={styles.inputField} />
              </div>
              <div className={styles.formGroup}>
                <textarea name="message" placeholder="Your Message" rows={5} required className={styles.inputField}></textarea>
              </div>
              <button type="submit" className={`btn ${styles.btnGlow}`} style={{ width: '100%', marginTop: '1rem' }}>Send Message</button>
            </form>
          </div>
        </div>
      </motion.section>

      {/* Simple & Classy Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogoText}>Wick & Wrap House</h3>
              <p>Exquisite handcrafted candles & luxury gifting to illuminate your most cherished moments.</p>
            </div>
            
            <div className={styles.footerLinks}>
              <h4>Explore</h4>
              <ul>
                <li><a href="#collection">The Collection</a></li>
                <li><a href="#reviews">Testimonials</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            
            <div className={styles.footerConnect}>
              <h4>Follow Us</h4>
              <div className={styles.socialIcons}>
                <a href="https://www.instagram.com/wicknwrap_house?igsh=MWc0ZjloejFxeW54OQ==" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.youtube.com/@Wicknwrap_house" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <span>&copy; {new Date().getFullYear()} Wick n Wrap House. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
