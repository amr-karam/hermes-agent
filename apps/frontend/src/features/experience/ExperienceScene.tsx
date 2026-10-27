'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Group, Mesh, RingGeometry, MeshPhysicalMaterial, MeshBasicMaterial, BufferGeometry, Color, BufferAttribute, PointsMaterial, Points, SphereGeometry } from 'three';

interface RingProps {
  index: number;
  radius: number;
  color: string;
  rotationSpeed: number;
  children?: React.ReactNode;
}

const Ring: React.FC<RingProps> = ({ index, radius, color, rotationSpeed, children }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  return (
    <group ref={groupRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <Float
        speed={0.5 + index * 0.1}
        rotationIntensity={0.2}
        floatIntensity={0.3}
      >
        <mesh
          geometry={new RingGeometry(radius - 0.05, radius, 64)}
          material={new MeshPhysicalMaterial({
            color,
            transparent: true,
            opacity: hovered ? 0.6 : 0.3,
            side: 2,
            metalness: 0.3,
            roughness: 0.4,
            transmission: 0.1,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1,
          })}
        />
        <mesh
          geometry={new RingGeometry(radius - 0.05, radius, 64)}
          material={new MeshBasicMaterial({
            color,
            transparent: true,
            opacity: hovered ? 0.4 : 0.15,
            side: 2,
            blending: 2,
          })}
        />
      </Float>
      {children}
    </group>
  );
};

interface StarFieldProps {
  count?: number;
  radius?: number;
}

const StarField: React.FC<StarFieldProps> = ({ count = 2000, radius = 50 }) => {
  const pointsRef = useRef<any>(null);
  const { scene } = useThree();

  useEffect(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color = new Color();
    const starColors = ['#ffffff', '#fff8e7', '#ffd700', '#00ffff', '#ff6b6b', '#a855f7'];

    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = starColors[Math.floor(Math.random() * starColors.length)];
      color.set(c);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    const material = new PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 2,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    return () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, count, radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005;
      pointsRef.current.rotation.x += delta * 0.002;
    }
  });

  return null;
};

const CenterGlow = () => {
  const { scene } = useThree();
  const glowRef = useRef<any>(null);

  useEffect(() => {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      blending: 2,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    glowRef.current = mesh;
    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  useFrame((state) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
      glowRef.current.scale.setScalar(scale);
      glowRef.current.material.opacity = 0.2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.15;
    }
  });

  return null;
};

export default function ExperienceScene() {
  return (
    <>
      <StarField count={3000} radius={80} />
      <Ring index={0} radius={1.5} color="#00ffff" rotationSpeed={0.3} />
      <Ring index={1} radius={2.2} color="#a855f7" rotationSpeed={-0.2} />
      <Ring index={2} radius={3.0} color="#ff6b6b" rotationSpeed={0.15} />
      <Ring index={3} radius={3.8} color="#22d3ee" rotationSpeed={-0.1} />
      <CenterGlow />
    </>
  );
}