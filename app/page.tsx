"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const starFieldRef = useRef<THREE.Mesh | null>(null);
  const earthArrowRef = useRef<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

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

    // Орбіта Землі
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

    // Зоряне небо
    const starGeometry = new THREE.SphereGeometry(90, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("/starfield.jpg"),
      side: THREE.BackSide,
    });
    const starField = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starField);
    starFieldRef.current = starField;

    // Стрілки
    let orbitProgress = 0;
    const p0 = orbitCurve.getPoint(orbitProgress);
    const point = new THREE.Vector3(p0.x, p0.y, 0);
    const t0 = orbitCurve.getTangent(orbitProgress).normalize();
    const tangent = new THREE.Vector3(t0.x, t0.y, 0).normalize();

    earth.position.copy(point);

    const earthArrow = new THREE.ArrowHelper(tangent, point, 3, 0x00ff00);
    scene.add(earthArrow);
    earthArrowRef.current = earthArrow;

    const solarArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0.4, -0.3).normalize(),
      new THREE.Vector3(0, 0, 0),
      5,
      0xff0000
    );
    scene.add(solarArrow);

    // Анімація
    const animate = () => {
      requestAnimationFrame(animate);

      orbitProgress += 0.0005;
      if (orbitProgress > 1) orbitProgress = 0;

      const p = orbitCurve.getPoint(orbitProgress);
      const point = new THREE.Vector3(p.x, p.y, 0);
      const t = orbitCurve.getTangent(orbitProgress).normalize();
      const tangent = new THREE.Vector3(t.x, t.y, 0).normalize();

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

    // Геолокація користувача
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("🌍 Latitude:", latitude, "Longitude:", longitude);

        // Далі тут можна обчислити положення користувача в екваторіальній системі
        // і адаптувати орієнтацію компаса
      },
      (error) => {
        console.error("❗ Геолокація не вдалася:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );


    // Сенсори телефону (без any)
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      (
        DeviceOrientationEvent as {
          requestPermission: () => Promise<"granted" | "denied">;
        }
      )
        .requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          } else {
            console.warn("Permission for orientation denied");
          }
        })
        .catch((error: unknown) => {
          console.error("Orientation permission error:", error);
        });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    function handleOrientation(event: DeviceOrientationEvent): void {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;

      if (starFieldRef.current) {
        starFieldRef.current.rotation.set(
          THREE.MathUtils.degToRad(beta * 0.05),
          THREE.MathUtils.degToRad(alpha * 0.05),
          THREE.MathUtils.degToRad(gamma * 0.05)
        );
      }
    }

    // Ресайз
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("deviceorientation", handleOrientation);
      if (mount && renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 overflow-hidden bg-black"
      style={{ touchAction: "none" }}
    />
  );
}
