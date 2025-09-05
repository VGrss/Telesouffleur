import { useEffect, useCallback, useRef } from 'react';
import { usePlaybackStore } from '../store/playback';

interface UseKeyboardControlsProps {
  onSpeedChange: (delta: number) => void;
  currentSpeed: number;
  onFullscreen?: () => void;
}

export function useKeyboardControls({ 
  onSpeedChange, 
  currentSpeed,
  onFullscreen 
}: UseKeyboardControlsProps) {
  const { 
    toggle, 
    jumpToTop, 
    jumpToEnd,
    setSpeed 
  } = usePlaybackStore();

  // Track which keys are currently pressed to avoid rapid-fire on hold
  const keysPressed = useRef(new Set<string>());
  const lastKeyTime = useRef<Record<string, number>>({});

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.code;
    const now = Date.now();
    
    // Debounce rapid keypress (except for space which should be responsive)
    if (key !== 'Space' && keysPressed.current.has(key)) {
      const lastTime = lastKeyTime.current[key] || 0;
      if (now - lastTime < 150) { // 150ms debounce
        return;
      }
    }

    keysPressed.current.add(key);
    lastKeyTime.current[key] = now;

    switch (key) {
      case 'Space':
        event.preventDefault();
        toggle();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const newSpeedUp = Math.min(10, currentSpeed + 1);
        onSpeedChange(newSpeedUp);
        setSpeed(newSpeedUp);
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        const newSpeedDown = Math.max(1, currentSpeed - 1);
        onSpeedChange(newSpeedDown);
        setSpeed(newSpeedDown);
        break;
        
      case 'Home':
      case 'PageUp':
        event.preventDefault();
        jumpToTop();
        break;
        
      case 'End':
      case 'PageDown':
        event.preventDefault();
        jumpToEnd();
        break;
        
      case 'KeyF':
        event.preventDefault();
        onFullscreen?.();
        break;
        
      default:
        // Don't prevent default for other keys
        break;
    }
  }, [toggle, onSpeedChange, currentSpeed, setSpeed, jumpToTop, jumpToEnd, onFullscreen]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keysPressed.current.delete(event.code);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Clear pressed keys when component unmounts or loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        keysPressed.current.clear();
      }
    };

    const handleWindowBlur = () => {
      keysPressed.current.clear();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);
}