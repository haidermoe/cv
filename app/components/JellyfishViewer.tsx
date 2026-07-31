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

  useEffect(() => {
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

    // 2. Camera (explicitly positioned at z = 5.5 to prevent top/bottom clipping)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

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

    // 5. Iridescent Ambient & Directional Rim Lighting (Noomo Labs Bioluminescent Look)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const rimLightPink = new THREE.DirectionalLight(0xe087ff, 4.5);
    rimLightPink.position.set(6, 4, 5);
    scene.add(rimLightPink);

    const rimLightCyan = new THREE.DirectionalLight(0x00f0ff, 4.5);
    rimLightCyan.position.set(-6, -4, 5);
    scene.add(rimLightCyan);

    const pointLight = new THREE.PointLight(0xa855f7, 6, 18);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Create Noomo Labs Iridescent Reflection Environment Map
    const envCanvas = document.createElement("canvas");
    envCanvas.width = 256;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext("2d");
    if (envCtx) {
      const grad = envCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.3, "#e087ff");
      grad.addColorStop(0.65, "#00f0ff");
      grad.addColorStop(1, "#1d4ed8");
      envCtx.fillStyle = grad;
      envCtx.fillRect(0, 0, 256, 256);
    }
    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

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

                // Upgrade Materials to Noomo Labs Iridescent Glass Physical Material with full Normal Map & Emissive Glow
                loadedModel.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    if (mesh.material) {
                      const oldMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;

                      if (oldMat.map) oldMat.map.colorSpace = THREE.SRGBColorSpace;
                      if (oldMat.normalMap) oldMat.normalMap.colorSpace = THREE.NoColorSpace;
                      if (oldMat.emissiveMap) oldMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;

                      const physicalMat = new THREE.MeshPhysicalMaterial({
                        map: oldMat.map || null,
                        normalMap: oldMat.normalMap || null,
                        normalScale: new THREE.Vector2(1.8, 1.8),  // Deep 3D surface ripples
                        roughnessMap: oldMat.roughnessMap || null,
                        emissiveMap: oldMat.emissiveMap || oldMat.map || null,
                        emissive: new THREE.Color(0x381045),      // Rich neon purple/violet inner glow
                        emissiveIntensity: 0.5,
                        color: new THREE.Color(0xffffff),
                        transmission: 0.05,                       // Solid, rich, vibrant non-ghost body!
                        opacity: 1.0,
                        transparent: false,
                        ior: 1.45,
                        roughness: 0.2,                           // Shiny polished surface with normal map ripples
                        metalness: 0.05,
                        clearcoat: 1.0,                           // Glossy outer skin varnish
                        clearcoatRoughness: 0.08,
                        iridescence: 0.85,                        // MAGICAL RAINBOW SOAP-BUBBLE CHROMATIC SHINE!
                        iridescenceIOR: 1.35,
                        iridescenceThicknessRange: [100, 400],
                        side: THREE.DoubleSide,
                        depthWrite: true,
                        depthTest: true
                      });

                      mesh.material = physicalMat;
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
                  const scale = 2.7 / maxDim;
                  loadedModel.scale.setScalar(scale);
                }

                scene.add(loadedModel);

                // Handle embedded Blender animations if present (filtering out root position and scale drift)
                if (gltf.animations && gltf.animations.length > 0) {
                  mixer = new THREE.AnimationMixer(loadedModel);
                  gltf.animations.forEach((clip) => {
                    clip.tracks = clip.tracks.filter((track) => {
                      const name = track.name.toLowerCase();
                      return !name.endsWith(".position") && !name.endsWith(".scale");
                    });

                    if (clip.tracks.length > 0) {
                      mixer?.clipAction(clip).play();
                    }
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
        // Weightless deep space floating & multi-axis breathing motion
        loadedModel.position.y = -0.18 + Math.sin(elapsedTime * 1.3) * 0.16;
        loadedModel.position.x = Math.cos(elapsedTime * 0.8) * 0.08;
        loadedModel.rotation.z = Math.sin(elapsedTime * 0.6) * 0.05;

        // Smooth Lerp Rotation to follow mouse position with fluid inertia
        loadedModel.rotation.y += (targetRotationY - loadedModel.rotation.y) * 0.04;
        loadedModel.rotation.x += (targetRotationX - loadedModel.rotation.x) * 0.04;
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

