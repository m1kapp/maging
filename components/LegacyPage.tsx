'use client';

export function LegacyPage({ src, fullscreen = false }: { src: string; fullscreen?: boolean }) {
  if (fullscreen) {
    return (
      <iframe
        src={src}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          zIndex: 9999,
          background: 'var(--mw-bg, #fff)',
        }}
      />
    );
  }
  return (
    <iframe
      src={src}
      style={{
        width: '100%',
        height: 'calc(100vh - 44px)',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
