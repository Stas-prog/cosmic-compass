"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const starFieldRef = useRef<THREE.Mesh | null>(null);
  const earthArrowRef = useRef<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffcc66, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffcc00 })
    );
    scene.add(sun);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x2266ff })
    );
    scene.add(earth);
    earthRef.current = earth;

    const orbitCurve = new THREE.EllipseCurve(0, 0, 6, 6, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, p.y, 0))
    );
    const orbitLine = new THREE.Line(
      orbitGeometry,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    scene.add(orbitLine);

    const starGeometry = new THREE.SphereGeometry(90, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("/starfield.jpg"),
      side: THREE.BackSide,
    });
    const starField = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starField);
    starFieldRef.current = starField;

    let orbitProgress = 0;
    const initialPoint2 = orbitCurve.getPoint(orbitProgress);
    const initialPoint = new THREE.Vector3(initialPoint2.x, initialPoint2.y, 0);
    const initialTangent2 = orbitCurve.getTangent(orbitProgress).normalize();
    const initialTangent = new THREE.Vector3(initialTangent2.x, initialTangent2.y, 0).normalize();

    earth.position.copy(initialPoint);

    const earthArrow = new THREE.ArrowHelper(initialTangent, initialPoint, 3, 0x00ff00);
    scene.add(earthArrow);
    earthArrowRef.current = earthArrow;

    const solarArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0.5, -0.2).normalize(),
      new THREE.Vector3(0, 0, 0),
      5,
      0xff0000
    );
    scene.add(solarArrow);

    const animate = () => {
      requestAnimationFrame(animate);

      orbitProgress += 0.0005;
      if (orbitProgress > 1) orbitProgress = 0;

      const point2 = orbitCurve.getPoint(orbitProgress);
      const point = new THREE.Vector3(point2.x, point2.y, 0);
      const tangent2 = orbitCurve.getTangent(orbitProgress).normalize();
      const tangent = new THREE.Vector3(tangent2.x, tangent2.y, 0).normalize();

      if (earthRef.current) {
        earthRef.current.position.copy(point);
        earthRef.current.rotation.y += 0.01;
      }

      if (earthArrowRef.current) {
        earthArrowRef.current.position.copy(point);
        earthArrowRef.current.setDirection(tangent);
      }

      if (starFieldRef.current) {
        starFieldRef.current.rotation.y += 0.0005;
      }

      renderer.render(scene, camera);
    };
    animate();

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      (DeviceOrientationEvent as any).requestPermission
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: any) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    function handleOrientation(event: DeviceOrientationEvent) {
      const alpha = event.alpha || 0;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      if (starFieldRef.current) {
        starFieldRef.current.rotation.set(
          THREE.MathUtils.degToRad(beta * 0.05),
          THREE.MathUtils.degToRad(alpha * 0.05),
          THREE.MathUtils.degToRad(gamma * 0.05)
        );
      }
    }

    return () => {
      if (renderer && renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return <div ref={mountRef} className="w-screen h-screen overflow-hidden" />;
}
