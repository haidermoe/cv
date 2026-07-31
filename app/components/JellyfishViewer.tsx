"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface JellyfishViewerProps {
  size?: number;
}

// Eagerly trigger fetch for /jellyfish0.glb at module load time (0ms latency!)
if (typeof window !== "undefined") {
  fetch("/jellyfish0.glb", { cache: "force-cache" }).catch(() => {});
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

    // 6. Direct native fetch & GLTFLoader parse (100% reliable Network request & zero worker security errors)
    const loader = new GLTFLoader();
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    const modelUrls = [
      "/jellyfish0.glb",
      "https://raw.githubusercontent.com/haidermoe/cv/main/public/jellyfish0.glb"
    ];

    const fetchAndParse = (urlIndex: number) => {
      if (urlIndex >= modelUrls.length) {
        clearTimeout(safetyTimeout);
        setLoading(false);
        return;
      }

      const url = modelUrls[urlIndex];
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buffer) => {
          loader.parse(
            buffer,
            "",
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

                // Traverse remaining Jellyfish meshes and apply a vibrant glowing translucent material
                loadedModel.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.material = new THREE.MeshPhongMaterial({
                      color: 0x60a5fa,
                      emissive: 0x2563eb,
                      emissiveIntensity: 0.5,
                      specular: 0xffffff,
                      shininess: 90,
                      transparent: true,
                      opacity: 0.92,
                      side: THREE.DoubleSide,
                      depthWrite: true,
                      depthTest: true
                    });
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
            (parseErr) => {
              console.error("GLTF Parse Error:", parseErr);
              fetchAndParse(urlIndex + 1);
            }
          );
        })
        .catch((err) => {
          console.warn(`Fetch failed for ${url}, trying next fallback...`, err);
          fetchAndParse(urlIndex + 1);
        });
    };

    fetchAndParse(0);

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

