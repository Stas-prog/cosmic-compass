// pages/index.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const earthRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffcc66, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const sunGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const earthGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x2266ff });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 5;
    scene.add(earth);
    earthRef.current = earth;

    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      5, 5,
      0, 2 * Math.PI,
      false,
      0
    );
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints.map(p => new THREE.Vector3(p.x, p.y, 0)));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);

    const starGeometry = new THREE.SphereGeometry(90, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("/starfield.jpg"),
      side: THREE.BackSide,
    });
    const starField = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starField);

    const animate = () => {
      requestAnimationFrame(animate);
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-screen h-screen overflow-hidden" />;
}
