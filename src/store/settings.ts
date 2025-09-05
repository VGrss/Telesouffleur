import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'high-contrast';

interface SettingsState {
  theme: Theme;
  reducedMotion: boolean;
  highContrast: boolean;
  
  setTheme: (theme: Theme) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  
  // Load settings from localStorage and system preferences
  loadSettings: () => void;
  saveSettings: () => void;
}

const detectPreferences = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  return {
    theme: (localStorage.getItem('teleprompter-theme') as Theme) || 
           (prefersDark ? 'dark' : 'light'),
    reducedMotion: JSON.parse(localStorage.getItem('teleprompter-reduced-motion') || 
                            String(prefersReducedMotion)),
    highContrast: JSON.parse(localStorage.getItem('teleprompter-high-contrast') || 
                           String(prefersHighContrast)),
  };
};

export const useSettings = create<SettingsState>((set, get) => ({
  ...detectPreferences(),
  
  setTheme: (theme: Theme) => {
    set({ theme });
    get().saveSettings();
  },
  
  setReducedMotion: (reducedMotion: boolean) => {
    set({ reducedMotion });
    get().saveSettings();
  },
  
  setHighContrast: (highContrast: boolean) => {
    set({ highContrast });
    get().saveSettings();
  },
  
  loadSettings: () => {
    set(detectPreferences());
  },
  
  saveSettings: () => {
    const { theme, reducedMotion, highContrast } = get();
    localStorage.setItem('teleprompter-theme', theme);
    localStorage.setItem('teleprompter-reduced-motion', String(reducedMotion));
    localStorage.setItem('teleprompter-high-contrast', String(highContrast));
  },
}));

// Apply theme to document root
export const applyTheme = (theme: Theme, highContrast: boolean = false) => {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
  
  if (highContrast || theme === 'high-contrast') {
    root.classList.add('theme-high-contrast');
  } else {
    root.classList.add(`theme-${theme}`);
  }
};