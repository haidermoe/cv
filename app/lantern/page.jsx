'use client';

import dynamic from 'next/dynamic';

// Dynamically import LanternScene with SSR disabled
const LanternScene = dynamic(() => import('@/components/LanternScene'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#60a5fa',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '1px'
      }}
    >
      Loading 3D Experience...
    </div>
  )
});

export default function LanternPage() {
  return (
    <main style={{ width: '100%', height: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>
      <LanternScene />
    </main>
  );
}
