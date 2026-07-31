"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface JellyfishViewerProps {
  size?: number;
}

export default function JellyfishViewer({ size = 320 }: JellyfishViewerProps) {
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

    // Mouse tracking targets
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates (-1 to +1)
      const mouseX = (clientX - centerX) / (window.innerWidth / 2);
      const mouseY = (clientY - centerY) / (window.innerHeight / 2);

      targetRotationY = mouseX * 0.8;
      targetRotationX = mouseY * 0.4;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera (explicitly positioned at z = 5)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 3. Renderer with transparent background
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

    // 5. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 2.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x8b5cf6, 4, 12);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 6. Load GLTF Model directly from /public/jellyfish0.glb
    const loader = new GLTFLoader();
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 6000);

    loader.load(
      "/jellyfish0.glb",
      (gltf) => {
        clearTimeout(safetyTimeout);
        setLoading(false);

        try {
          loadedModel = gltf.scene;

          // Remove Blender work placeholders if present
          const objectsToRemove: THREE.Object3D[] = [];
          loadedModel.traverse((child) => {
            const name = child.name || "";
            if (
              name.includes("Work_") ||
              name.includes("Camera_target") ||
              name.includes("Empty_Words") ||
              name.includes("Sphere_From") ||
              name.includes("NoomoLabs")
            ) {
              objectsToRemove.push(child);
            }
          });

          objectsToRemove.forEach((obj) => {
            if (obj.parent) {
              obj.parent.remove(obj);
            }
          });

          // Traverse remaining Jellyfish meshes and ensure DoubleSide and visible materials
          loadedModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((mat: any) => {
                  mat.side = THREE.DoubleSide;
                  mat.depthWrite = true;
                  mat.depthTest = true;

                  // Ensure material is 100% visible even if GLTF BLEND mode has low opacity
                  if (mat.opacity !== undefined && mat.opacity < 0.3) {
                    mat.opacity = 0.95;
                  }

                  // Add vibrant royal blue emissive glow
                  if (mat.emissive) {
                    mat.emissive = new THREE.Color(0x2563eb);
                    mat.emissiveIntensity = 0.4;
                  }

                  mat.needsUpdate = true;
                });
              }
            }
          });

          // Center and auto-scale ONLY the 3-layer Jellyfish model to fit canvas cleanly
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = box.getCenter(new THREE.Vector3());
          const boxSize = box.getSize(new THREE.Vector3());

          if (isFinite(center.x) && isFinite(center.y) && isFinite(center.z)) {
            loadedModel.position.sub(center);
          }

          const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
          if (isFinite(maxDim) && maxDim > 0) {
            const scale = 2.8 / maxDim;
            loadedModel.scale.setScalar(scale);
          }

          scene.add(loadedModel);

          // Handle embedded Blender animations if present
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(loadedModel);
            gltf.animations.forEach((clip) => {
              mixer?.clipAction(clip).play();
            });
          }
        } catch (err) {
          console.error("Error processing GLTF scene:", err);
        }
      },
      undefined,
      (error) => {
        clearTimeout(safetyTimeout);
        console.error("Error loading /jellyfish0.glb:", error);
        setLoading(false);
      }
    );

    // 7. Animation Loop with smooth lerp towards mouse & floating motion
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (mixer) mixer.update(delta);

      if (loadedModel) {
        // Floating Y animation (organic breathing)
        loadedModel.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

        // Smooth Lerp Rotation to follow mouse position
        loadedModel.rotation.y += (targetRotationY - loadedModel.rotation.y) * 0.05;
        loadedModel.rotation.x += (targetRotationX - loadedModel.rotation.x) * 0.05;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
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
          margin: "0 auto",
          background: "transparent"
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
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            background: "transparent",
            color: "#2563eb",
            fontSize: "13.5px",
            fontWeight: "800"
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(37, 99, 235, 0.2)",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}
          />
          <span>Loading 3D Model...</span>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

