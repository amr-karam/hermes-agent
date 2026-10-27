'use client';

import dynamic from 'next/dynamic';

const Experience = dynamic(() => import('@/features/experience/Experience'), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center">Loading 3D experience...</div>,
});

export default function Home() {
  return (
    <main className="relative h-screen w-full">
      <Experience />
    </main>
  );
}