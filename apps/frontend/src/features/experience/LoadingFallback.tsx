'use client';

import React, { useRef, useEffect, useState } from 'react';

interface LoadingFallbackProps {
  className?: string;
}

export default function LoadingFallback({ className = '' }: LoadingFallbackProps) {
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 90) {
      const timer = setTimeout(() => {
        setProgress(100);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen w-full ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 20, 40, 0.8) 0%, rgba(0, 0, 0, 1) 100%)',
      }}
    >
      <div
        className="relative w-64 h-64 mb-8"
        style={{ filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.3))' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(0, 255, 255, 0.1)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={`${283 - (progress / 100) * 283}`}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out',
              filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))',
            }}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold tracking-wider mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-red-400 bg-clip-text text-transparent">
          Hermes Agent
        </div>
        <div className="text-lg text-gray-400 mb-8">
          Initializing 3D Experience...
        </div>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
          <div
            ref={barRef}
            className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400 via-purple-500 to-red-400"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
            }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-500 font-mono">
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}