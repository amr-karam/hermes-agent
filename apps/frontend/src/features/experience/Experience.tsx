'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Center } from '@react-three/drei';
import ExperienceScene from './ExperienceScene';
import LoadingFallback from './LoadingFallback';
import { useContextLossRecovery } from './useContextLossRecovery';

const canvasStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  position: 'absolute',
  top: 0,
  left: 0,
};

export default function Experience() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isContextLost, retryCount, reset } = useContextLossRecovery(canvasRef, {
    maxRetries: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!mounted ? (
        <LoadingFallback />
      ) : (
        <>
          {isContextLost && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 10,
                color: 'white',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 16 }}>WebGL Context Lost</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>
                Attempting recovery... (attempt {retryCount}/3)
              </div>
            </div>
          )}
          <Canvas
            ref={canvasRef as any}
            style={canvasStyles}
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }}
          >
            <Environment
              preset="city"
              background={false}
              ground={false}
            />
            <ExperienceScene />
            <ContactShadows opacity={0.3} scale={10} blur={2} />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={10}
            />
            <Html
              as="div"
              style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}
              transform
              fullscreen
            >
              <div
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)',
                }}
              >
                Hermes Agent 3D Experience
              </div>
            </Html>
          </Canvas>
        </>
      )}
    </div>
  );
}