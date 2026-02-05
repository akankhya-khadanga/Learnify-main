/**
 * PHASE 18: GalaxyCanvas Component
 * R3F scene with orbital mechanics and particle field
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitNode } from './OrbitNode';
import { GALAXY_CLUSTERS } from '@/mocks/knowledgeOrbit';
import { OrbitNode as OrbitNodeType } from '@/mocks/knowledgeOrbit';
import { Suspense } from 'react';
import * as THREE from 'three';

interface GalaxyCanvasProps {
  onNodeClick: (node: OrbitNodeType) => void;
  selectedNode: OrbitNodeType | null;
}

// Cluster center glow
function ClusterCenter({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer glow layers */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Orbit path rings
function OrbitPath({ radius, position, color }: { radius: number; position: [number, number, number]; color: string }) {
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
    );
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group position={position}>
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.15 }))} />
    </group>
  );
}

export function GalaxyCanvas({ onNodeClick, selectedNode }: GalaxyCanvasProps) {
  return (
    <div className="w-full h-full bg-[#0F1115]">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={60} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={100}
            maxPolarAngle={Math.PI / 1.8}
          />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 20, 0]} intensity={1} color="#C9B458" />
          <pointLight position={[35, 20, 0]} intensity={1} color="#6DAEDB" />
          <pointLight position={[-35, 20, 0]} intensity={1} color="#C27BA0" />

          {/* Star field */}
          <Stars
            radius={200}
            depth={50}
            count={5000}
            factor={4}
            saturation={0.5}
            fade
            speed={0.5}
          />

          {/* Render galaxy clusters */}
          {GALAXY_CLUSTERS.map((cluster) => (
            <group key={cluster.id}>
              {/* Cluster center glow */}
              <ClusterCenter position={cluster.centerPosition} color={cluster.color} />

              {/* Orbit paths */}
              {cluster.topics.map((topic) => (
                <OrbitPath
                  key={`path-${topic.id}`}
                  radius={topic.orbitRadius}
                  position={cluster.centerPosition}
                  color={cluster.color}
                />
              ))}

              {/* Topic nodes */}
              {cluster.topics.map((topic) => (
                <OrbitNode
                  key={topic.id}
                  node={topic}
                  parentPosition={cluster.centerPosition}
                  onClick={onNodeClick}
                  isPaused={selectedNode?.id === topic.id}
                  isSelected={selectedNode?.id === topic.id}
                />
              ))}
            </group>
          ))}

          {/* Bloom effect for glow */}
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
