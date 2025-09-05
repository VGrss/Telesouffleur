// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private onFPSChange?: (fps: number) => void;
  private isMonitoring = false;
  private animationId: number | null = null;

  constructor(onFPSChange?: (fps: number) => void) {
    this.onFPSChange = onFPSChange;
  }

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    const measure = () => {
      if (!this.isMonitoring) return;
      
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime - this.lastTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.onFPSChange?.(this.fps);
        
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      
      this.animationId = requestAnimationFrame(measure);
    };
    
    this.animationId = requestAnimationFrame(measure);
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getFPS(): number {
    return this.fps;
  }
}

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total?: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
} => {
  const performance = window.performance as any;
  
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
      total: performance.memory.totalJSHeapSize / (1024 * 1024),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
    };
  }
  
  return { used: 0 };
};

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | null;
  
  return ((...args: any[]) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Check if large text might cause performance issues
export function checkLargeTextWarning(text: string): {
  isLarge: boolean;
  charCount: number;
  wordCount: number;
  recommendation?: string;
} {
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  const isLarge = charCount > 100000; // 100k characters
  const isVeryLarge = charCount > 300000; // 300k characters
  
  let recommendation: string | undefined;
  
  if (isVeryLarge) {
    recommendation = "Consider breaking this script into smaller sections for better performance";
  } else if (isLarge) {
    recommendation = "Large script detected - performance may be affected during scrolling";
  }
  
  return {
    isLarge,
    charCount,
    wordCount,
    recommendation,
  };
}

// Schema versioning for localStorage
export interface StorageSchema {
  version: number;
  data: any;
}

export class VersionedStorage {
  private key: string;
  private currentVersion: number;
  private migrations: Record<number, (data: any) => any>;

  constructor(key: string, version: number = 1) {
    this.key = key;
    this.currentVersion = version;
    this.migrations = {};
  }

  addMigration(fromVersion: number, migration: (data: any) => any) {
    this.migrations[fromVersion] = migration;
  }

  save(data: any): void {
    const schema: StorageSchema = {
      version: this.currentVersion,
      data,
    };
    localStorage.setItem(this.key, JSON.stringify(schema));
  }

  load(defaultData: any = null): any {
    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) return defaultData;

      const parsed = JSON.parse(stored);
      
      // Handle old data without version
      if (!parsed.version) {
        return this.migrateData({ version: 0, data: parsed });
      }

      return this.migrateData(parsed);
    } catch (error) {
      console.warn(`Failed to load ${this.key}:`, error);
      return defaultData;
    }
  }

  private migrateData(schema: StorageSchema): any {
    let { version, data } = schema;

    while (version < this.currentVersion) {
      if (this.migrations[version]) {
        data = this.migrations[version](data);
      }
      version++;
    }

    // Save migrated data
    if (version !== schema.version) {
      this.save(data);
    }

    return data;
  }
}

// Browser capability detection
export const getBrowserCapabilities = () => {
  return {
    webGL: !!(window.WebGLRenderingContext || window.WebGL2RenderingContext),
    fullscreen: !!(document.exitFullscreen || (document as any).webkitExitFullscreen),
    requestAnimationFrame: !!window.requestAnimationFrame,
    localStorage: (() => {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
    fileReader: !!window.FileReader,
    clipboard: !!navigator.clipboard,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};