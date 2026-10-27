import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hermes Agent - 3D Experience',
  description: 'Interactive 3D experience powered by Three.js and React Three Fiber',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}