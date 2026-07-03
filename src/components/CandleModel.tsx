"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

// Preload so the model is ready the moment the hero mounts.
useGLTF.preload("/candles.glb");

// Strong parallax: 45° maximum rotation from mouse movement for a dramatic 3D feel.
const MAX_TILT = THREE.MathUtils.degToRad(45);

type Props = {
  /** 0 → 1 scroll progress of the hero sequence, driven by ScrollTrigger. */
  scrollProgress: RefObject<number>;
};

export default function CandleModel({ scrollProgress }: Props) {
  const { scene } = useGLTF("/candles.glb");

  // Clone so React strict re-mounts / HMR don't mutate the cached scene,
  // and enable shadow casting on every mesh.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Outer group → mouse parallax tilt.
  const outer = useRef<THREE.Group>(null);
  // Inner group → kept for structure.
  const inner = useRef<THREE.Group>(null);

  // Normalized pointer (-1 → 1). A window listener keeps parallax working even
  // though the canvas itself is pointer-events:none (so the CTA stays clickable).
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const p = scrollProgress.current ?? 0;

    if (outer.current) {
      // Mouse parallax — strong rotation that makes the 3D feel immersive.
      const targetTiltX = -pointer.current.y * MAX_TILT;
      const targetTiltY = pointer.current.x * MAX_TILT;
      outer.current.rotation.x = THREE.MathUtils.lerp(
        outer.current.rotation.x,
        targetTiltX,
        0.08
      );
      outer.current.rotation.y = THREE.MathUtils.lerp(
        outer.current.rotation.y,
        targetTiltY,
        0.08
      );
    }

    // Fade the candle out as user scrolls (0→0.5 scroll = full→gone).
    if (model) {
      const fadeOut = Math.max(0, 1 - p * 2.5);
      model.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, fadeOut, 0.1);
        }
      });
    }
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </group>
  );
}
