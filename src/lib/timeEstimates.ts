// WPM estimates based on teleprompter speed settings
const SPEED_TO_WPM_MAP: Record<number, number> = {
  1: 60,   // Very slow
  2: 80,   // Slow
  3: 100,  // Relaxed
  4: 120,  // Comfortable
  5: 140,  // Normal
  6: 160,  // Brisk
  7: 180,  // Fast
  8: 200,  // Very fast
  9: 220,  // Rapid
  10: 240, // Maximum
};

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function getWPMForSpeed(speed: number): number {
  const clampedSpeed = Math.max(1, Math.min(10, Math.round(speed)));
  return SPEED_TO_WPM_MAP[clampedSpeed] || 140;
}

export function estimateDuration(text: string, speed: number = 5): {
  words: number;
  wpm: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
} {
  const words = countWords(text);
  const wpm = getWPMForSpeed(speed);
  const totalSeconds = words > 0 ? Math.round((words / wpm) * 60) : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formatted = totalSeconds < 60 
    ? `${totalSeconds}s`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    words,
    wpm,
    minutes,
    seconds,
    totalSeconds,
    formatted,
  };
}

// Calculate approximate completion percentage based on scroll position
export function calculateProgress(
  scrollPosition: number, 
  contentHeight: number, 
  viewportHeight: number
): number {
  if (contentHeight <= viewportHeight) return 0;
  
  const maxScroll = contentHeight - viewportHeight;
  return Math.min(100, Math.max(0, (scrollPosition / maxScroll) * 100));
}

// Format time for display
export function formatTime(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${Math.round(totalSeconds)}s`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  
  if (minutes < 60) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}