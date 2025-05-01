"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ARViewer({ modelUrl }) {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("Initializing AR...");
  const [isModelPlaced, setIsModelPlaced] = useState(false);

  const scene = useRef(new THREE.Scene());
  const renderer = useRef(null);
  const camera = useRef(null);
  const model = useRef(null);
  const controller = useRef(null);
  const hitTestSource = useRef(null);
  const placementIndicator = useRef(null);

  useEffect(() => {
    // 1. Initialize Renderer
    const initRenderer = () => {
      renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      renderer.current.xr.enabled = true;
      mountRef.current.appendChild(renderer.current.domElement);
    };

    // 2. Check WebXR Support
    const checkXRSupport = async () => {
      if (!navigator.xr) {
        setError("WebXR not supported in your browser");
        return false;
      }
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
          setError("AR not supported on your device");
          return false;
        }
        return true;
      } catch {
        setError("Failed to check AR support");
        return false;
      }
    };

    // 3. Load 3D Model
    const loadModel = () => {
      setMessage("Loading 3D model...");
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            model.current = gltf.scene;
            model.current.visible = false;
            scene.current.add(model.current);
            setMessage("Tap to place product");
            resolve();
          },
          undefined,
          () => {
            setError("Failed to load 3D model");
            reject();
          }
        );
      });
    };

    // 4. Add Lighting and Camera
    const setupScene = () => {
      camera.current = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      scene.current.add(camera.current);

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.current.add(light);

      // Placement Indicator (optional visual feedback)
      placementIndicator.current = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true })
      );
      placementIndicator.current.visible = false;
      scene.current.add(placementIndicator.current);
    };

    // 5. Start AR Session
    const startARSession = async () => {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test', 'dom-overlay'],
          domOverlay: { root: document.body }
        });

        session.addEventListener('end', () => {
          setIsModelPlaced(false);
          setMessage("AR session ended");
        });

        renderer.current.xr.setSession(session);
        const referenceSpace = await session.requestReferenceSpace('viewer');
        const viewerSpace = await session.requestReferenceSpace('local');
        hitTestSource.current = await session.requestHitTestSource({ space: referenceSpace });

        controller.current = renderer.current.xr.getController(0);
        controller.current.addEventListener('select', () => onSelect(viewerSpace));
        scene.current.add(controller.current);

        renderer.current.setAnimationLoop((time, frame) => {
          if (frame) updateARFrame(frame, viewerSpace);
          renderer.current.render(scene.current, camera.current);
        });
      } catch {
        setError("Failed to start AR session");
      }
    };

    // 6. Handle Frame Updates
    const updateARFrame = (frame, referenceSpace) => {
      if (!hitTestSource.current || isModelPlaced) return;

      const hitTestResults = frame.getHitTestResults(hitTestSource.current);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        if (!pose) return;

        const hitMatrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
        placementIndicator.current.visible = true;
        placementIndicator.current.position.setFromMatrixPosition(hitMatrix);
      }
    };

    // 7. On Select Tap
    const onSelect = (referenceSpace) => {
      if (isModelPlaced) return;

      const frame = renderer.current.xr.getFrame();
      if (!frame || !hitTestSource.current) return;

      const hitTestResults = frame.getHitTestResults(hitTestSource.current);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        if (!pose) return;

        const hitMatrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
        model.current.position.setFromMatrixPosition(hitMatrix);
        model.current.visible = true;
        placementIndicator.current.visible = false;
        setIsModelPlaced(true);
        setMessage(null);
      }
    };

    // 8. Initialize AR Flow
    const initializeAR = async () => {
      try {
        initRenderer();
        setupScene();
        const supported = await checkXRSupport();
        if (!supported) return;
        await loadModel();
        await startARSession();
      } catch (err) {
        console.error("Initialization Error:", err);
        setError("AR initialization failed");
      }
    };

    initializeAR();

    // Cleanup on unmount
    return () => {
      if (renderer.current) {
        renderer.current.setAnimationLoop(null);
        if (renderer.current.domElement) {
          renderer.current.domElement.remove();
        }
      }
    };
  }, [modelUrl,isModelPlaced]);

  // UI feedback
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <h3>{error}</h3>
        <p>Try Chrome for Android or Safari on iOS 15+</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {message && (
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '15px',
          fontSize: '18px',
          borderRadius: '10px',
          margin: '0 20px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
