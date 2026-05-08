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
  fullscreen?: boolean; // slides/news — leave mounted on body, don't move to ref
}

/**
 * Renders a full maging page from a declarative config.
 * Waits for Maging + any mode scripts to load, then calls Maging.page(config).mount(ref).
 */
export function MagingPage({ config, scripts = [], fullscreen = false }: MagingPageProps) {
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
      // Load mode scripts, skipping already-loaded ones
      const toLoad = scripts.filter(src => !document.querySelector('script[src="' + src + '"]'));
      if (toLoad.length === 0) {
        setReady(true);
        return;
      }
      let loaded = 0;
      toLoad.forEach(src => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => {
          loaded++;
          if (loaded >= toLoad.length) {
            // Give the script a tick to execute and register widgets
            setTimeout(() => setReady(true), 0);
          }
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

    const page = window.Maging.page(config);
    if (page?.el) {
      if (fullscreen) {
        // Slides/news — page already mounted to body by builder, leave it there.
        // Just refresh after a tick for ECharts.
        setTimeout(() => {
          if (window.Maging?.refreshAll) window.Maging.refreshAll();
        }, 100);
      } else {
        // Dashboard/landing — relocate from body into our ref
        page.mount(ref.current);
        setTimeout(() => {
          if (window.Maging?.refreshAll) window.Maging.refreshAll();
        }, 100);
      }
    }

    return () => {
      if (page?.destroy) page.destroy();
    };
  }, [ready, config]);

  return <div ref={ref} />;
}
