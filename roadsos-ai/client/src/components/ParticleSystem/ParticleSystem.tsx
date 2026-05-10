'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  emergencyMode?: boolean;
}

/**
 * Particle component that renders and animates particles with volumetric effect
 */
const Particles = ({ count = 1000, emergencyMode = false }: ParticleSystemProps) => {
  const meshRef = useRef<THREE.Points>(null);

  // Generate particle geometry
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      // Random positions in sphere
      const r = Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count]);

  // Animation loop
  useFrame(() => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Subtle drift motion
      positions[i] += Math.sin(Date.now() * 0.0001 + i) * 0.01;
      positions[i + 1] += Math.cos(Date.now() * 0.00008 + i) * 0.008;
      positions[i + 2] += Math.sin(Date.now() * 0.00012 + i) * 0.009;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={particleGeometry}>
      <pointsMaterial
        size={emergencyMode ? 0.15 : 0.08}
        color={emergencyMode ? '#ff3333' : '#0099ff'}
        transparent
        opacity={emergencyMode ? 0.8 : 0.6}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Lights component for volumetric effect
 */
const Lights = ({ emergencyMode = false }: { emergencyMode?: boolean }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight
        position={[20, 20, 20]}
        intensity={emergencyMode ? 1.5 : 1}
        color={emergencyMode ? '#ff3333' : '#0099ff'}
      />
      <pointLight
        position={[-20, -20, -20]}
        intensity={0.5}
        color={emergencyMode ? '#ff1111' : '#0055ff'}
      />
    </>
  );
};

/**
 * ParticleSystem component - renders animated particles with volumetric lighting
 */
export const ParticleSystem: React.FC<ParticleSystemProps> = ({ count = 1000, emergencyMode = false }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 50], far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
      >
        <Lights emergencyMode={emergencyMode} />
        <Particles count={count} emergencyMode={emergencyMode} />
      </Canvas>
    </div>
  );
};

export default ParticleSystem;
