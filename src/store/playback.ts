import { create } from 'zustand';
import { ScrollEngine } from '../lib/scrollEngine';

interface PlaybackState {
  isPlaying: boolean;
  speed: number;
  position: number;
  scrollEngine: ScrollEngine | null;
  
  // Actions
  setScrollEngine: (engine: ScrollEngine) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  jumpToPosition: (position: number) => void;
  jumpToTop: () => void;
  jumpToEnd: () => void;
  setPosition: (position: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  isPlaying: false,
  speed: 5,
  position: 0,
  scrollEngine: null,

  setScrollEngine: (engine: ScrollEngine) => {
    const currentEngine = get().scrollEngine;
    if (currentEngine) {
      currentEngine.destroy();
    }
    set({ scrollEngine: engine });
  },

  play: () => {
    const { scrollEngine, speed } = get();
    if (scrollEngine && !scrollEngine.getIsPlaying()) {
      scrollEngine.start(speed);
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const { scrollEngine } = get();
    if (scrollEngine && scrollEngine.getIsPlaying()) {
      scrollEngine.pause();
      set({ isPlaying: false });
    }
  },

  toggle: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  stop: () => {
    const { scrollEngine } = get();
    if (scrollEngine) {
      scrollEngine.stop();
      set({ isPlaying: false, position: 0 });
    }
  },

  setSpeed: (speed: number) => {
    const { scrollEngine } = get();
    const clampedSpeed = Math.max(1, Math.min(10, speed));
    set({ speed: clampedSpeed });
    
    if (scrollEngine) {
      scrollEngine.setSpeed(clampedSpeed);
    }
  },

  jumpToPosition: (position: number) => {
    const { scrollEngine } = get();
    if (scrollEngine) {
      scrollEngine.jumpToPosition(position);
    }
  },

  jumpToTop: () => {
    const { scrollEngine } = get();
    if (scrollEngine) {
      scrollEngine.jumpToTop();
    }
  },

  jumpToEnd: () => {
    const { scrollEngine } = get();
    if (scrollEngine) {
      scrollEngine.jumpToEnd();
    }
  },

  setPosition: (position: number) => {
    set({ position });
  },
}));