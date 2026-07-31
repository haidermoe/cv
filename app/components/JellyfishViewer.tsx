"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface JellyfishViewerProps {
  size?: number;
}

export default function JellyfishViewer({ size = 280 }: JellyfishViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let loadedModel: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Clear existing canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.5;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 2.0);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x8b5cf6, 3, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 6. Load GLTF Model
    const loader = new GLTFLoader();
    loader.load(
      "/jellyfish0.glb",
      (gltf) => {
        loadedModel = gltf.scene;

        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
              });
            }
          }
        });

        // Handle animation if model has embedded animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(loadedModel);
          gltf.animations.forEach((clip) => {
            mixer?.clipAction(clip).play();
          });
        }

        // Center and auto-scale model
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const boxSize = box.getSize(new THREE.Vector3());

        if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
          loadedModel.position.sub(center);
        }

        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        if (isFinite(maxDim) && maxDim > 0) {
          const scale = 2.4 / maxDim;
          loadedModel.scale.setScalar(scale);
        }

        scene.add(loadedModel);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading jellyfish0.glb:", error);
        setLoading(false);
      }
    );

    // 7. Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixer) mixer.update(delta);
      if (loadedModel && !mixer) {
        loadedModel.rotation.y += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [size]);

  if (!mounted) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(14, 13, 21, 0.9) 100%)",
          border: "1.5px solid rgba(96, 165, 250, 0.4)",
          margin: "0 auto"
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(14, 13, 21, 0.9) 100%)",
        border: "1.5px solid rgba(96, 165, 250, 0.4)",
        boxShadow: "0 0 45px rgba(37, 99, 235, 0.35), inset 0 0 20px rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: "0 auto",
        cursor: "grab"
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "rgba(14, 13, 21, 0.8)",
            color: "#60a5fa",
            fontSize: "13px",
            fontWeight: "700"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "3px solid rgba(96, 165, 250, 0.3)",
              borderTopColor: "#60a5fa",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <span>جاري تحميل مجسم 3D...</span>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
