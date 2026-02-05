/**
 * PHASE 18: OrbitNode Component
 * Reusable 3D sphere for planets/moons with orbit animation
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitNode as OrbitNodeType } from '@/mocks/knowledgeOrbit';

interface OrbitNodeProps {
  node: OrbitNodeType;
  parentPosition?: [number, number, number];
  onClick: (node: OrbitNodeType) => void;
  isPaused?: boolean;
  isSelected?: boolean;
}

export function OrbitNode({ 
  node, 
  parentPosition = [0, 0, 0], 
  onClick, 
  isPaused = false,
  isSelected = false 
}: OrbitNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(node.angle * (Math.PI / 180)); // Convert to radians

  // Orbit animation
  useFrame((state, delta) => {
    if (!meshRef.current || isPaused) return;

    // Update orbit angle
    angleRef.current += delta * node.orbitSpeed * 0.2;

    // Calculate position on orbit
    const x = parentPosition[0] + Math.cos(angleRef.current) * node.orbitRadius;
    const z = parentPosition[2] + Math.sin(angleRef.current) * node.orbitRadius;
    const y = parentPosition[1];

    meshRef.current.position.set(x, y, z);

    // Gentle rotation
    meshRef.current.rotation.y += delta * 0.3;

    // Pulse effect when selected
    if (isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Size based on type
  const baseSize = node.type === 'topic' ? 1.2 : 0.6;
  const size = baseSize * (1 + node.difficulty * 0.1);

  // Glow intensity based on progress
  const glowIntensity = 0.3 + node.progress * 0.7;

  // Color
  const color = new THREE.Color(node.color);

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity}
          metalness={0.3}
          roughness={0.4}
        />
      </Sphere>

      {/* Outer glow sphere */}
      <Sphere
        args={[size * 1.3, 32, 32]}
        position={[
          parentPosition[0] + Math.cos(angleRef.current) * node.orbitRadius,
          parentPosition[1],
          parentPosition[2] + Math.sin(angleRef.current) * node.orbitRadius,
        ]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label on hover */}
      {hovered && (
        <Html
          position={[
            parentPosition[0] + Math.cos(angleRef.current) * node.orbitRadius,
            parentPosition[1] + size + 1,
            parentPosition[2] + Math.sin(angleRef.current) * node.orbitRadius,
          ]}
          center
        >
          <div className="bg-white dark:bg-slate-800/90 border border-neon/30 px-3 py-1 rounded text-primary text-sm font-bold whitespace-nowrap backdrop-blur-sm shadow-lg">
            {node.label}
          </div>
        </Html>
      )}

      {/* Render children (moons) */}
      {node.children?.map((child) => (
        <OrbitNode
          key={child.id}
          node={child}
          parentPosition={[
            parentPosition[0] + Math.cos(angleRef.current) * node.orbitRadius,
            parentPosition[1],
            parentPosition[2] + Math.sin(angleRef.current) * node.orbitRadius,
          ]}
          onClick={onClick}
          isPaused={isPaused}
        />
      ))}
    </group>
  );
}
