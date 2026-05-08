'use client';

import { useEffect, useRef } from 'react';

export function LegacyPage({ src, fullscreen = false }: { src: string; fullscreen?: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);

  // Hide the iframe's internal nav/footer (Next.js layout already provides them)
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const hide = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        if (!doc.getElementById('mw-nextjs-hide')) {
          const style = doc.createElement('style');
          style.id = 'mw-nextjs-hide';
          style.textContent = 'maging-nav, maging-footer, .mw-site-nav, .mw-site-footer { display: none !important; }';
          doc.head.appendChild(style);
        }
      } catch (_) { /* cross-origin iframe — skip */ }
    };
    iframe.addEventListener('load', hide);
    return () => iframe.removeEventListener('load', hide);
  }, [src]);

  if (fullscreen) {
    return (
      <iframe
        ref={ref}
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
      ref={ref}
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
