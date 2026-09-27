'use client';

import { useEffect, useRef, useState } from 'react';

interface UseContextLossRecoveryOptions {
  onContextLost?: () => void;
  onContextRestored?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseContextLossRecoveryReturn {
  isContextLost: boolean;
  retryCount: number;
  reset: () => void;
}

export function useContextLossRecovery(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseContextLossRecoveryOptions = {}
): UseContextLossRecoveryReturn {
  const {
    onContextLost,
    onContextRestored,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [isContextLost, setIsContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (!isMountedRef.current) return;

    console.warn('WebGL context lost, attempting recovery...');
    setIsContextLost(true);
    onContextLost?.();

    const attemptRecovery = (attempt: number) => {
      if (!isMountedRef.current) return;
      if (attempt > maxRetries) {
        console.error('Max retries reached for WebGL context recovery');
        return;
      }

      setRetryCount(attempt);
      console.log(`Attempting WebGL context recovery (${attempt}/${maxRetries})...`);

      retryTimeoutRef.current = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (gl) {
            console.log('WebGL context restored successfully');
            setIsContextLost(false);
            setRetryCount(0);
            onContextRestored?.();
          } else {
            attemptRecovery(attempt + 1);
          }
        } else {
          attemptRecovery(attempt + 1);
        }
      }, retryDelay * attempt);
    };

    attemptRecovery(1);
  };

  const handleContextRestored = () => {
    if (!isMountedRef.current) return;
    console.log('WebGL context restored event received');
    setIsContextLost(false);
    setRetryCount(0);
    onContextRestored?.();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', handleContextLost as EventListener);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [canvasRef, maxRetries, retryDelay, onContextLost, onContextRestored]);

  const reset = () => {
    setIsContextLost(false);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  };

  return { isContextLost, retryCount, reset };
}