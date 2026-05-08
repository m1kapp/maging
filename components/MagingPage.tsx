'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Maging: any;
  }
}

interface MagingPageProps {
  config: Record<string, any>;
  scripts?: string[];
}

/**
 * Renders a full maging page from a declarative config.
 * Waits for Maging + any mode scripts to load, then calls Maging.page(config).mount(ref).
 */
export function MagingPage({ config, scripts = [] }: MagingPageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Load additional mode scripts (e.g. maging-landing.js, maging-pitch.js)
  useEffect(() => {
    function checkReady() {
      return !!window.Maging?.page;
    }

    function onReady() {
      if (scripts.length === 0) {
        setReady(true);
        return;
      }
      // Load mode scripts sequentially
      let loaded = 0;
      scripts.forEach(src => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => {
          loaded++;
          if (loaded >= scripts.length) setReady(true);
        };
        document.head.appendChild(s);
      });
    }

    if (checkReady()) {
      onReady();
    } else {
      window.addEventListener('maging:ready', onReady);
      return () => window.removeEventListener('maging:ready', onReady);
    }
  }, []);

  // Mount the page once ready
  useEffect(() => {
    if (!ready || !ref.current || !window.Maging?.page) return;

    // Clear previous content
    ref.current.innerHTML = '';

    // Use mount target to avoid body→ref move (which breaks ECharts sizing)
    const page = window.Maging.page(config);
    if (page?.el) {
      // page() auto-mounted to body — use .mount() to relocate into our ref
      page.mount(ref.current);

      // ECharts needs time to lay out in new container before resize.
      // Double rAF isn't enough — use a short delay to let CSS grid settle.
      setTimeout(() => {
        if (window.Maging?.refreshAll) window.Maging.refreshAll();
      }, 100);
    }

    return () => {
      if (page?.destroy) page.destroy();
    };
  }, [ready, config]);

  return <div ref={ref} />;
}
