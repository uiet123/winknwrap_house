"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

// Preload so the model is ready the moment the hero mounts.
useGLTF.preload("/candles.glb");

// Strong parallax: 45° maximum rotation from mouse movement for a dramatic 3D feel.
const MAX_TILT = THREE.MathUtils.degToRad(45);

// Pinch zoom limits (scale multiplier on the model group).
const MIN_SCALE = 0.4;
const MAX_SCALE = 3.0;

type Props = {
  /** 0 → 1 scroll progress of the hero sequence, driven by ScrollTrigger. */
  scrollProgress: RefObject<number>;
};

/** Returns the pixel distance between two touch points. */
function pinchDistance(t0: Touch, t1: Touch) {
  const dx = t1.clientX - t0.clientX;
  const dy = t1.clientY - t0.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

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

  // Outer group → rotation (mouse parallax / touch drag).
  const outer = useRef<THREE.Group>(null);
  // Inner group → scale (pinch zoom).
  const inner = useRef<THREE.Group>(null);

  // Normalized pointer (-1 → 1) for desktop parallax.
  const pointer = useRef({ x: 0, y: 0 });

  // Touch drag state — single finger → rotation.
  const touchState = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    rotY: 0,   // accumulated Y rotation (full 360° unclamped)
    rotX: 0,   // accumulated X rotation (clamped)
  });

  // Pinch zoom state — two fingers → scale.
  const pinchState = useRef({
    active: false,
    lastDist: 0,
    scale: 1,       // target scale
    currentScale: 1, // smoothed scale applied each frame
  });

  // Is mobile device?
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = window.matchMedia("(pointer: coarse)").matches;

    // ── Desktop: mouse parallax ──────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      if (isMobile.current) return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ── Mobile: touch events ─────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      if (!isMobile.current) return;

      if (e.touches.length === 2) {
        // Two fingers → start pinch
        pinchState.current.active = true;
        pinchState.current.lastDist = pinchDistance(e.touches[0], e.touches[1]);
        // Disable single-finger rotation while pinching
        touchState.current.active = false;
      } else if (e.touches.length === 1) {
        // One finger → start rotate
        touchState.current.active = true;
        touchState.current.lastX = e.touches[0].clientX;
        touchState.current.lastY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isMobile.current) return;

      if (e.touches.length === 2 && pinchState.current.active) {
        // ── Pinch zoom ───────────────────────────────────────────────────────
        const newDist = pinchDistance(e.touches[0], e.touches[1]);
        const ratio = newDist / pinchState.current.lastDist;

        pinchState.current.scale = THREE.MathUtils.clamp(
          pinchState.current.scale * ratio,
          MIN_SCALE,
          MAX_SCALE
        );
        pinchState.current.lastDist = newDist;
        e.preventDefault(); // prevent page zoom
      } else if (e.touches.length === 1 && touchState.current.active) {
        // ── Single-finger rotate ─────────────────────────────────────────────
        const t = e.touches[0];
        const dx = t.clientX - touchState.current.lastX;
        const dy = t.clientY - touchState.current.lastY;

        const sensitivity = THREE.MathUtils.degToRad(0.6);
        touchState.current.rotY += dx * sensitivity;
        touchState.current.rotX += dy * sensitivity;

        // Clamp vertical tilt so the candle doesn't flip upside down.
        touchState.current.rotX = THREE.MathUtils.clamp(
          touchState.current.rotX,
          -Math.PI / 2.2,
          Math.PI / 2.2
        );

        touchState.current.lastX = t.clientX;
        touchState.current.lastY = t.clientY;
        e.preventDefault(); // prevent page scroll while rotating
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isMobile.current) return;

      if (e.touches.length < 2) {
        pinchState.current.active = false;
      }
      if (e.touches.length === 0) {
        touchState.current.active = false;
      }
      // If one finger lifts but one remains → resume rotate from that finger
      if (e.touches.length === 1) {
        touchState.current.active = true;
        touchState.current.lastX = e.touches[0].clientX;
        touchState.current.lastY = e.touches[0].clientY;
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(() => {
    const p = scrollProgress.current ?? 0;

    // ── Rotation ─────────────────────────────────────────────────────────────
    if (outer.current) {
      if (isMobile.current) {
        outer.current.rotation.y = THREE.MathUtils.lerp(
          outer.current.rotation.y,
          touchState.current.rotY,
          0.1
        );
        outer.current.rotation.x = THREE.MathUtils.lerp(
          outer.current.rotation.x,
          touchState.current.rotX,
          0.1
        );
      } else {
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
    }

    // ── Pinch zoom: smooth scale on inner group ───────────────────────────────
    if (inner.current && isMobile.current) {
      pinchState.current.currentScale = THREE.MathUtils.lerp(
        pinchState.current.currentScale,
        pinchState.current.scale,
        0.12 // smooth easing
      );
      const s = pinchState.current.currentScale;
      inner.current.scale.set(s, s, s);
    }

    // ── Fade out on scroll ────────────────────────────────────────────────────
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
      {/* inner group handles pinch scale independently of rotation */}
      <group ref={inner}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </group>
  );
}
