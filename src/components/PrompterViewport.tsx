import { useEffect, useRef, useMemo } from 'react';
import { ScrollEngine } from '../lib/scrollEngine';
import { usePlaybackStore } from '../store/playback';
import { checkLargeTextWarning } from '../lib/performance';
import { useSettings } from '../store/settings';

interface PrompterViewportProps {
  script: string;
  settings: {
    speed: number;
    fontSize: number;
    margin: number;
    textColor: string;
    backgroundColor: string;
    mirror: boolean;
  };
}

export default function PrompterViewport({ script, settings }: PrompterViewportProps) {
  const { fontSize, margin, textColor, backgroundColor, mirror, speed } = settings;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useSettings();
  
  const { 
    setScrollEngine, 
    setPosition, 
    scrollEngine,
    setSpeed 
  } = usePlaybackStore();

  // Check for large text performance warning
  const textAnalysis = useMemo(() => {
    return checkLargeTextWarning(script);
  }, [script]);

  // Memoize display text to avoid re-renders
  const displayText = useMemo(() => {
    return script || 'Paste your script in the editor to get started...';
  }, [script]);

  // Initialize scroll engine
  useEffect(() => {
    if (contentRef.current) {
      const engine = new ScrollEngine(
        contentRef.current,
        (position) => setPosition(position)
      );
      setScrollEngine(engine);
      
      return () => {
        engine.destroy();
      };
    }
  }, [setScrollEngine, setPosition]);

  // Update speed when settings change
  useEffect(() => {
    if (scrollEngine) {
      setSpeed(speed);
    }
  }, [speed, scrollEngine, setSpeed]);

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      // Force recalculation of scroll bounds
      if (scrollEngine && containerRef.current) {
        const currentPosition = scrollEngine.getCurrentPosition();
        scrollEngine.jumpToPosition(currentPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollEngine]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-hidden relative"
      style={{ backgroundColor }}
    >
      <div 
        className={`${mirror ? 'scale-x-[-1]' : ''} transition-transform duration-300`}
        style={{
          paddingLeft: `${margin}%`,
          paddingRight: `${margin}%`,
        }}
      >
        <div 
          ref={contentRef}
          className="whitespace-pre-wrap leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            color: textColor,
            lineHeight: 1.5,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            paddingTop: '50vh',
            paddingBottom: '50vh',
            maxWidth: '70ch',
            margin: '0 auto',
            // Performance optimizations
            contain: textAnalysis.isLarge ? 'layout style' : undefined,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            // Disable text shadows for large text to improve performance
            textShadow: textAnalysis.isLarge ? 'none' : undefined,
            // Respect reduced motion preference
            transition: reducedMotion ? 'none' : undefined,
          }}
        >
          {displayText}
        </div>

        {/* Performance warning for large text */}
        {textAnalysis.isLarge && textAnalysis.recommendation && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-2 rounded text-sm max-w-xs">
            <strong>Performance Notice:</strong> {textAnalysis.recommendation}
          </div>
        )}
      </div>
    </div>
  );
}