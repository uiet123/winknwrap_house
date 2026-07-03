"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Bounds } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CandleModel from "./CandleModel";
import styles from "@/app/page.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Soft radial golden gradient used as the glow pooled beneath the candle. */
function useGlowTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "rgba(255, 196, 128, 0.85)");
    g.addColorStop(0.4, "rgba(226, 158, 82, 0.35)");
    g.addColorStop(1, "rgba(226, 158, 82, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export default function Hero3D() {
  // Shared scroll progress (0 → 1) read by the candle inside the R3F loop.
  const scrollProgress = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const glow = useGlowTexture();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Track scroll progress so the candle can fade out.
      ScrollTrigger.create({
        start: 0,
        end: () => window.innerHeight * 1.5,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });
    }, rootRef);

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => {
      clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.hero3dRoot}>
      <div className={styles.hero3dCanvas}>
        <Canvas
          shadows="soft"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 15], fov: 35 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[6, 9, 6]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <spotLight
            position={[-7, 11, 7]}
            angle={0.35}
            penumbra={1}
            intensity={45}
            color="#ffe6c0"
            castShadow
          />
          <pointLight
            position={[0, -1.6, 1.5]}
            intensity={6}
            distance={8}
            color="#ffab5e"
          />

          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.15}>
              <CandleModel scrollProgress={scrollProgress} />
            </Bounds>
            <Environment preset="studio" />
          </Suspense>

          <mesh position={[0, -1.55, 0]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[7, 7]} />
            <meshBasicMaterial
              map={glow}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.45}
            scale={13}
            blur={2.8}
            far={4.5}
            color="#160b00"
          />
        </Canvas>
      </div>
    </div>
  );
}
