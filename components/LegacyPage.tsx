'use client';

export function LegacyPage({ src, fullscreen = false }: { src: string; fullscreen?: boolean }) {
  if (fullscreen) {
    return (
      <iframe
        src={src}
        style={{
          position: 'fixed',
          top: 44,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: 'calc(100vh - 44px)',
          border: 'none',
          zIndex: 50,
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
