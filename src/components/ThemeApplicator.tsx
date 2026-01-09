
'use client';

import { useEffect } from 'react';
import { subscribeTheme } from '@/lib/services/settings-service';
import { defaultTheme } from '@/lib/defaults';
import type { ThemeSettings } from '@/lib/types';
import { useTheme } from 'next-themes';

// --- HEX to HSL Conversion ---
function hexToHsl(hex: string): string | null {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    console.warn(`Invalid hex color provided to hexToHsl: ${hex}`);
    return null;
  }
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const num = parseInt(c.join(''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}


function applyThemeToDom(colors: ThemeSettings['colors']) {
    const root = document.documentElement;
    const styleSheet = document.getElementById('dynamic-theme-styles') || document.createElement('style');
    styleSheet.id = 'dynamic-theme-styles';
    
    const rootVars = [
        `--primary: ${hexToHsl(colors.light.accent)}`,
        `--background: ${hexToHsl(colors.light.background)}`,
        `--card: ${hexToHsl(colors.light.surface)}`,
        `--foreground: ${hexToHsl(colors.light.text)}`,
    ].join('; ');

    const darkVars = [
        `--primary: ${hexToHsl(colors.dark.accent)}`,
        `--background: ${hexToHsl(colors.dark.background)}`,
        `--card: ${hexToHsl(colors.dark.surface)}`,
        `--foreground: ${hexToHsl(colors.dark.text)}`,
    ].join('; ');

    styleSheet.innerHTML = `
        :root { ${rootVars}; }
        .dark { ${darkVars}; }
    `;

    if (!document.getElementById('dynamic-theme-styles')) {
        document.head.appendChild(styleSheet);
    }
}


export function ThemeApplicator() {
  // We don't use the theme from useTheme() here, as our logic
  // relies on the .dark class applied by next-themes.
  
  useEffect(() => {
    // Apply defaults on initial mount to prevent flicker
    applyThemeToDom(defaultTheme.colors);

    // Subscribe to live changes from Firestore
    const unsubscribe = subscribeTheme((settings) => {
      if (settings && settings.colors) {
        applyThemeToDom(settings.colors);
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // This component does not render anything
}
