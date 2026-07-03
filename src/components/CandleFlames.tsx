"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Single animated candle flame using a custom shader billboard. */
function Flame({
  position,
  scale = 1,
  scrollProgress,
}: {
  position: [number, number, number];
  scale?: number;
  scrollProgress: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Billboard: always face camera
          vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec2 offset = (uv - 0.5) * 2.0;
          float s = length(position.xyz) > 0.0 ? 1.0 : 1.0;
          mvPosition.xy += offset * vec2(0.12, 0.28) * s;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        // Simplex-ish noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 uv = vUv;
          
          // Center and normalize
          vec2 p = (uv - 0.5) * 2.0;
          
          // Flame shape — tapers to a point at the top
          float flameWidth = 0.5 - abs(p.y - 0.2) * 0.4;
          flameWidth = max(flameWidth, 0.05);
          
          // Wobble
          float wobble = noise(vec2(uv.y * 4.0, uTime * 3.0)) * 0.15;
          p.x += wobble * (1.0 - uv.y);
          
          // Distance from center axis
          float d = abs(p.x) / flameWidth;
          
          // Teardrop: narrow at top, wider at bottom
          float shape = 1.0 - smoothstep(0.0, 1.0, d);
          shape *= smoothstep(-0.5, 0.0, p.y + 0.4); // cut bottom
          shape *= smoothstep(1.2, 0.4, p.y);         // cut top taper
          
          // Animate flicker
          float flicker = noise(vec2(uTime * 5.0, 0.0)) * 0.15 + 0.85;
          shape *= flicker;
          
          // Color: white core → yellow → orange → transparent
          vec3 innerColor = vec3(1.0, 0.95, 0.85);  // white-hot core
          vec3 midColor = vec3(1.0, 0.7, 0.2);      // yellow
          vec3 outerColor = vec3(1.0, 0.35, 0.05);   // orange
          
          float coreD = length(p * vec2(1.5, 0.8)) * 1.5;
          vec3 color = mix(innerColor, midColor, smoothstep(0.0, 0.5, coreD));
          color = mix(color, outerColor, smoothstep(0.3, 0.9, coreD));
          
          float alpha = shape * uOpacity;
          alpha = pow(alpha, 1.2);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = scrollProgress.current ?? 0;
    const fadeOut = Math.max(0, 1 - p * 2.5);

    shaderMaterial.uniforms.uTime.value = t;
    shaderMaterial.uniforms.uOpacity.value = fadeOut;

    // Flicker the point light
    if (lightRef.current) {
      const flicker = Math.sin(t * 8) * 0.15 + Math.sin(t * 13) * 0.1 + 0.9;
      lightRef.current.intensity = 3.5 * flicker * scale * fadeOut;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} material={shaderMaterial} scale={scale}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Warm point light that illuminates the candle top */}
      <pointLight
        ref={lightRef}
        position={[0, 0.05, 0.05]}
        color="#ffaa44"
        intensity={3.5 * scale}
        distance={3}
        decay={2}
      />
    </group>
  );
}

type Props = {
  scrollProgress: React.RefObject<number>;
  /** Positions of the flame tips (top of each wick). */
  flamePositions?: [number, number, number][];
  flameScales?: number[];
};

export default function CandleFlames({
  scrollProgress,
  flamePositions,
  flameScales,
}: Props) {
  // Default positions calibrated for the candles.glb model
  // These will need fine-tuning based on exact wick positions
  const positions = flamePositions || [
    [0, 1.85, 0],       // Tall candle (center)
    [-0.85, 0.95, 0],   // Short candle (left)
    [0.85, 1.35, 0],    // Medium candle (right)
  ];

  const scales = flameScales || [1.2, 0.8, 1.0];

  return (
    <group>
      {positions.map((pos, i) => (
        <Flame
          key={i}
          position={pos as [number, number, number]}
          scale={scales[i]}
          scrollProgress={scrollProgress}
        />
      ))}
    </group>
  );
}
