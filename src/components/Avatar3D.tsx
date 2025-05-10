import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./Avatar3D.css";

interface Avatar3DProps {
  modelSrc?: string;
  alt?: string;
  speech?: string;
  isSpeaking?: boolean;
  fallbackImageSrc?: string;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  toggleMute: () => void;
  isPaused: boolean;
  togglePause: () => void;
  replayAudio: () => void;
  speechRate: number;

  setSpeechRate: React.Dispatch<React.SetStateAction<number>>;
}

const Avatar3D: React.FC<Avatar3DProps> = ({
  modelSrc = "https://threejs.org/examples/models/gltf/Duck/Duck.glb",
  alt = "עוזר וירטואלי",
  speech = "",
  isSpeaking = false,
  fallbackImageSrc = "https://via.placeholder.com/300/f0f0f0/333?text=Avatar",
  audioRef,
  isMuted,
  toggleMute,
  isPaused,
  togglePause,
  replayAudio,
  speechRate,
  setSpeechRate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  // Effect for initial setup
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // BASIC THREE.JS SETUP
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(300, 300);
      // Clear the container before adding renderer
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Add light - make it very bright
      const light = new THREE.AmbientLight(0xffffff, 2);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // Load model
      const loader = new GLTFLoader();

      loader.load(
        modelSrc,
        (gltf) => {
          const model = gltf.scene;

          // Position the model lower
          model.position.y = -1.2; // Move down

          // Scale appropriately
          model.scale.set(0.5, 0.5, 0.5);

          scene.add(model);
          modelRef.current = model;

          // Do an initial render
          renderer.render(scene, camera);
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
          setLoadError(true);

          // Show a cube if model fails
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);

          const animate = () => {
            const id = requestAnimationFrame(animate);
            animationRef.current = id;

            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
          };

          animate();
        }
      );
    } catch (error) {
      console.error("Error setting up 3D scene:", error);
      setLoadError(true);
    }

    return () => {
      // Clean up animation frame
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clean up renderer
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [modelSrc]);

  // Effect for speaking animation
  useEffect(() => {
    if (
      !modelRef.current ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current
    )
      return;

    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (isSpeaking) {
      // Animate only when speaking
      const animate = () => {
        const id = requestAnimationFrame(animate);
        animationRef.current = id;

        // Gentle nodding motion
        modelRef.current!.rotation.x = Math.sin(Date.now() * 0.003) * 0.1;
        modelRef.current!.rotation.y = Math.sin(Date.now() * 0.002) * 0.1;

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      animate();
    } else {
      // Just render once to reset position
      modelRef.current.rotation.x = 0;
      modelRef.current.rotation.y = 0;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [isSpeaking]);

  if (loadError) {
    return (
      <div className="avatar3d-container">
        <div className="avatar3d-fallback">
          <img src={fallbackImageSrc} alt={alt} />
        </div>
      </div>
    );
  }

  return (
    <div className="avatar3d-container">
      <div className="audio-controls">
        <div className="mute-button" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </div>
        <div className="pause-button" onClick={togglePause}>
          {isPaused ? "▶️" : "⏸️"}
        </div>{" "}
        <button className="replay-button" onClick={replayAudio}>
          <span className="material-icons">replay</span>
        </button>
        <div className="speed-wrapper">
          <button
            className="speed-toggle-button"
            onClick={() => setShowSpeedControl((prev) => !prev)}
          >
            ⏩
          </button>

          {showSpeedControl && (
            <div className="rate-control-popup">
              <label htmlFor="rateSlider">
                מהירות דיבור: {speechRate.toFixed(1)}x
              </label>
              <input
                id="rateSlider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="avatar3d-scene" ref={containerRef}></div>
    </div>
  );
};

export default Avatar3D;
