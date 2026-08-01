"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface JellyfishViewerProps {
  size?: number;
  customColor?: string | null;
  materialMode?: "solid" | "glass" | "wireframe";
  positionX?: number;
}

export default function JellyfishViewer({ size = 320, customColor = null, materialMode = "solid", positionX = 0 }: JellyfishViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const loadedModelRef = useRef<THREE.Group | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

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

    // 2. Camera with dynamic aspect ratio
    const initialWidth = container.clientWidth || window.innerWidth;
    const initialHeight = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, initialWidth / initialHeight, 0.1, 1000);
    camera.position.set(0, 0, 5.8);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Handle dynamic window / container resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Clear existing canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    // 5. Balanced Studio Lighting for Rich Deep Textures
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 1.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 2.0, 15);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

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
                loadedModelRef.current = loadedModel;

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

                // Apply initial material settings
                loadedModel.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    if (mesh.material) {
                      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                      materials.forEach((mat) => {
                        mat.side = THREE.DoubleSide;
                        mat.depthWrite = true;
                        mat.depthTest = true;
                        mat.needsUpdate = true;

                        const stdMat = mat as THREE.MeshStandardMaterial;
                        if (stdMat.map) {
                          stdMat.map.colorSpace = THREE.SRGBColorSpace;
                          stdMat.map.needsUpdate = true;
                        }

                        stdMat.wireframe = materialMode === "wireframe";
                        if (materialMode === "glass") {
                          stdMat.transparent = true;
                          stdMat.opacity = 0.55;
                        } else if (materialMode === "wireframe") {
                          stdMat.transparent = true;
                          stdMat.opacity = 0.85;
                        } else {
                          stdMat.transparent = false;
                          stdMat.opacity = 1.0;
                        }

                        if (customColor) {
                          stdMat.color = new THREE.Color(0xffffff); // Preserve texture map 100% intact
                          stdMat.emissive = new THREE.Color(customColor);
                          stdMat.emissiveIntensity = 0.55;
                        } else {
                          stdMat.color = new THREE.Color(0xffffff);
                          stdMat.emissive = new THREE.Color(0x000000);
                          stdMat.emissiveIntensity = 0;
                        }
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
                  const scale = 2.9 / maxDim; // Perfectly sized without any edge truncation!
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

    // Preload Desktop textur images into Three.js textures
    const TEXTURE_PATHS = [
      "/textures/jellyfish+3d+model_tripo_part_0_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_1_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_2_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_3_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_10_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_16_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_17_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_20_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_6_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_7_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_8_basecolor.jpg",
      "/textures/jellyfish+3d+model_tripo_part_9_basecolor.jpg"
    ];

    const textureLoader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = TEXTURE_PATHS.map((path) => {
      const tex = textureLoader.load(path);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });

    let currentTexIndex = -1;

    fetchAndParse(0);

    // 7. Animation Loop with autonomous weightless deep space floating & automatic Desktop texture cycling
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (mixer) mixer.update(delta);

      if (loadedModel) {
        // Pure vertical floating motion - 100% straight & upright (0 degree tilt)
        loadedModel.position.y = -0.18 + Math.sin(elapsedTime * 1.2) * 0.12;
        loadedModel.position.x = positionX;
        loadedModel.rotation.set(0, 0, 0);

        // Automatic Desktop texture morphing / cycling every 2.8s
        if (loadedTextures.length > 0) {
          const texIdx = Math.floor(elapsedTime / 2.8) % loadedTextures.length;
          if (texIdx !== currentTexIndex) {
            currentTexIndex = texIdx;
            const activeTex = loadedTextures[texIdx];
            loadedModel.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                  mats.forEach((m) => {
                    const stdMat = m as THREE.MeshStandardMaterial;
                    stdMat.map = activeTex;
                    stdMat.needsUpdate = true;
                  });
                }
              }
            });
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = "";
    };
  }, [size]);

  // Live real-time material & color customization update effect
  useEffect(() => {
    const model = loadedModelRef.current;
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            const stdMat = mat as THREE.MeshStandardMaterial;

            stdMat.wireframe = materialMode === "wireframe";
            if (materialMode === "glass") {
              stdMat.transparent = true;
              stdMat.opacity = 0.55;
            } else if (materialMode === "wireframe") {
              stdMat.transparent = true;
              stdMat.opacity = 0.85;
            } else {
              stdMat.transparent = false;
              stdMat.opacity = 1.0;
            }

            if (customColor) {
              stdMat.color = new THREE.Color(0xffffff); // Preserve texture map 100% intact!
              stdMat.emissive = new THREE.Color(customColor);
              stdMat.emissiveIntensity = 0.55;
            } else {
              stdMat.color = new THREE.Color(0xffffff);
              stdMat.emissive = new THREE.Color(0x000000);
              stdMat.emissiveIntensity = 0;
            }

            stdMat.needsUpdate = true;
          });
        }
      }
    });

    if (pointLightRef.current) {
      pointLightRef.current.color = new THREE.Color(customColor || 0xa855f7);
    }
  }, [customColor, materialMode]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        cursor: "grab",
        overflow: "visible"
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

