import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

interface ModelViewerProps {
  modelPath: string;
  modelType?: 'glb' | 'fbx' | 'obj';
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  cameraPosition?: [number, number, number];
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  showShadows?: boolean;
  backgroundColor?: string;
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
  metalness?: number;
  roughness?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

// GLB Model Component with proper error handling
function GLBModel({ 
  path, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  metalness = 0.3,
  roughness = 0.4,
  onLoad,
  onError 
}: { 
  path: string; 
  scale: number; 
  position: [number, number, number]; 
  rotation: [number, number, number];
  metalness: number;
  roughness: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const [hasError, setHasError] = useState(false);
  
  let scene;
  try {
    const result = useGLTF(path);
    scene = result.scene;
  } catch (error) {
    setHasError(true);
    onError?.(error as Error);
  }
  
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene && !hasError) {
      // Apply materials to all meshes
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color || new THREE.Color(0xffffff),
            metalness: metalness,
            roughness: roughness,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      onLoad?.();
    }
  }, [scene, metalness, roughness, onLoad, hasError]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (hasError || !scene) {
    return <FallbackCube scale={scale} position={position} />;
  }

  return (
    <group ref={meshRef} scale={scale} position={position} rotation={rotation}>
      <primitive object={scene} />
    </group>
  );
}

// FBX Model Component
function FBXModel({ 
  path, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  metalness = 0.3,
  roughness = 0.4,
  onLoad,
  onError 
}: { 
  path: string; 
  scale: number; 
  position: [number, number, number]; 
  rotation: [number, number, number];
  metalness: number;
  roughness: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const fbx = useFBX(path);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color || new THREE.Color(0xffffff),
            metalness: metalness,
            roughness: roughness,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      onLoad?.();
    }
  }, [fbx, metalness, roughness, onLoad]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (!fbx) return null;

  return (
    <group ref={meshRef} scale={scale} position={position} rotation={rotation}>
      <primitive object={fbx} />
    </group>
  );
}

// OBJ Model Component
function OBJModel({ 
  path, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  metalness = 0.3,
  roughness = 0.4,
  onLoad,
  onError 
}: { 
  path: string; 
  scale: number; 
  position: [number, number, number]; 
  rotation: [number, number, number];
  metalness: number;
  roughness: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const obj = useLoader(OBJLoader, path, undefined, (error) => {
    console.error('Error loading OBJ model:', error);
    onError?.(error as Error);
  });
  
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff),
            metalness: metalness,
            roughness: roughness,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      onLoad?.();
    }
  }, [obj, metalness, roughness, onLoad]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef} scale={scale} position={position} rotation={rotation}>
      <primitive object={obj} />
    </group>
  );
}

// Fallback Cube Component
function FallbackCube({ scale = 1, position = [0, 0, 0] }: { scale: number; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.2} />
    </mesh>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusGeometry args={[1, 0.3, 16, 32]} />
      <meshStandardMaterial color="#FF1493" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function ModelViewer({
  modelPath,
  modelType = 'glb',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = true,
  enableZoom = true,
  enablePan = false,
  cameraPosition = [0, 0, 5],
  ambientLightIntensity = 0.5,
  directionalLightIntensity = 1,
  showShadows = true,
  backgroundColor = '#0B0B0D',
  environmentPreset = 'studio',
  metalness = 0.3,
  roughness = 0.4,
  onLoad,
  onError,
  className = 'w-full h-full'
}: ModelViewerProps) {
  const [modelError, setModelError] = useState(false);

  const handleError = (error: Error) => {
    console.error('Model loading error:', error);
    setModelError(true);
    onError?.(error);
  };

  return (
    <div className={className}>
      <Canvas
        shadows={showShadows}
        style={{ background: backgroundColor }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} />
        
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={directionalLightIntensity}
          castShadow={showShadows}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFD700" />
        <pointLight position={[5, -5, 5]} intensity={0.5} color="#FF1493" />

        {/* Environment */}
        <Environment preset={environmentPreset} />

        {/* Model - Always show fallback for now */}
        <Suspense fallback={<LoadingSpinner />}>
          <FallbackCube scale={scale} position={position} />
        </Suspense>

        {/* Contact Shadows */}
        {showShadows && (
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
        )}

        {/* Camera Controls */}
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enableZoom={enableZoom}
          enablePan={enablePan}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
