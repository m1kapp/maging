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

  // Load additional mode scripts (e.g. maging-slide.js, maging-landing.js)
  useEffect(() => {
    const mode = (config as any).mode || 'dashboard';

    function checkCoreReady() {
      return !!window.Maging?.page;
    }

    function checkBuilderReady() {
      if (mode === 'dashboard') return true;
      return !!window.Maging?._pageBuilders?.[mode];
    }

    function loadScriptsAndSetReady() {
      if (scripts.length === 0) {
        setReady(true);
        return;
      }
      const toLoad = scripts.filter(src => !document.querySelector('script[src="' + src + '"]'));
      if (toLoad.length === 0) {
        // Scripts already loaded — poll for builder registration
        const poll = setInterval(() => {
          if (checkBuilderReady()) { clearInterval(poll); setReady(true); }
        }, 10);
        setTimeout(() => clearInterval(poll), 3000); // safety timeout
        return;
      }
      let loaded = 0;
      toLoad.forEach(src => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => {
          loaded++;
          if (loaded >= toLoad.length) {
            // Poll until builder is registered (IIFE may need a tick)
            const poll = setInterval(() => {
              if (checkBuilderReady()) { clearInterval(poll); setReady(true); }
            }, 10);
            setTimeout(() => clearInterval(poll), 3000);
          }
        };
        document.head.appendChild(s);
      });
    }

    if (checkCoreReady()) {
      loadScriptsAndSetReady();
    } else {
      window.addEventListener('maging:ready', () => loadScriptsAndSetReady());
    }
  }, []);

  // Mount the page once ready
  useEffect(() => {
    if (!ready || !ref.current || !window.Maging?.page) return;

    // Clear previous content
    ref.current.innerHTML = '';

    // Determine mode — slides auto-detect, explicit mode, or dashboard
    const mode = (config as any).mode || ((config as any).slides ? 'slide' : 'dashboard');
    const builder = mode !== 'dashboard' ? window.Maging._pageBuilders?.[mode] : null;
    const page = builder ? builder(config) : window.Maging.page(config);
    if (page?.el) {
      if (fullscreen) {
        // Slides/news — page already mounted to body by builder
      } else {
        // Dashboard/landing — relocate from body into our ref
        page.mount(ref.current);
      }
    }

    return () => {
      if (page?.destroy) page.destroy();
    };
  }, [ready, config]);

  return <div ref={ref} />;
}
