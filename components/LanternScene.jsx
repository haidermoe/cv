'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { damp3, dampE } from 'maath/easing';

// ----------------------------------------------------
// 1. Model Component with Idle & Parallax Animations
// ----------------------------------------------------
function Model(props) {
  const group = useRef();
  
  // Try loading GLTF model if available
  let gltf = null;
  try {
    gltf = useGLTF('/models/lantern.glb');
  } catch (e) {
    // Graceful fallback to procedural mesh if file is missing
  }

  useFrame((state, delta) => {
    if (!group.current) return;

    // 1. Continuous Idle Floating Animation (bobbing on Y-axis)
    const idleY = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;

    // 2. Parallax Target Position based on state.pointer (R3F internal pointer)
    const targetX = state.pointer.x * 0.5;
    const targetY = idleY + state.pointer.y * 0.5;
    const targetZ = 0;

    // Smoothly damp position using maath/easing damp3
    damp3(group.current.position, [targetX, targetY, targetZ], 0.25, delta);

    // 3. Parallax Target Rotation (Y and X axis tilt)
    const targetRotX = -state.pointer.y * 0.3;
    const targetRotY = state.pointer.x * 0.6;
    const targetRotZ = 0;

    // Smoothly damp rotation using maath/easing dampE
    dampE(group.current.rotation, [targetRotX, targetRotY, targetRotZ], 0.25, delta);
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {gltf && gltf.scene ? (
        <primitive object={gltf.scene} scale={1.5} />
      ) : (
        /* Beautiful Procedural 3D Lantern Mesh Fallback */
        <group scale={1.2}>
          {/* Top Cap */}
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.6, 0.4, 6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
          
          {/* Top Ring / Handle */}
          <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.04, 16, 32]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Frame Pillars */}
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * 0.45, 0.5, Math.sin(angle) * 0.45]}>
              <cylinderGeometry args={[0.03, 0.03, 1.2, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}

          {/* Inner Glowing Glass Core */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 1.0, 16]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={2.5}
              roughness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
          
          {/* Glowing Flame / Core Light */}
          <pointLight position={[0, 0.5, 0]} color="#60a5fa" intensity={4} distance={6} />

          {/* Base */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.55, 0.5, 0.3, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Preload GLTF model
try {
  useGLTF.preload('/models/lantern.glb');
} catch (e) {}

// ----------------------------------------------------
// 2. Main LanternScene Component
// ----------------------------------------------------
export default function LanternScene() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -2]} intensity={0.5} color="#3b82f6" />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}
