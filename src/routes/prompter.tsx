import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScriptEditor from '../components/ScriptEditor';
import PrompterViewport from '../components/PrompterViewport';
import ControlsBar from '../components/ControlsBar';
import ShortcutsModal from '../components/ShortcutsModal';
import { useKeyboardControls } from '../lib/useKeyboardControls';
import { useFullscreen } from '../lib/useFullscreen';

export default function Prompter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [script, setScript] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Fullscreen for the entire prompter area
  const { isFullscreen, toggleFullscreen } = useFullscreen(viewportRef);
  
  // Settings from URL params or defaults
  const [settings, setSettings] = useState({
    speed: parseInt(searchParams.get('speed') || '5'),
    fontSize: parseInt(searchParams.get('fontSize') || '24'),
    margin: parseInt(searchParams.get('margin') || '20'),
    textColor: searchParams.get('textColor') || '#000000',
    backgroundColor: searchParams.get('backgroundColor') || '#ffffff',
    mirror: searchParams.get('mirror') === '1',
  });

  // Update URL when settings change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('speed', settings.speed.toString());
    params.set('fontSize', settings.fontSize.toString());
    params.set('margin', settings.margin.toString());
    params.set('textColor', settings.textColor);
    params.set('backgroundColor', settings.backgroundColor);
    params.set('mirror', settings.mirror ? '1' : '0');
    setSearchParams(params);
  }, [settings, setSearchParams]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle speed changes from keyboard
  const handleSpeedChange = (newSpeed: number) => {
    updateSetting('speed', newSpeed);
  };

  // Keyboard controls
  useKeyboardControls({
    onSpeedChange: handleSpeedChange,
    currentSpeed: settings.speed,
    onFullscreen: toggleFullscreen,
  });

  // Toggle maximize text area
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden" ref={viewportRef}>
        {/* Script Editor - hidden when maximized */}
        {!isMaximized && !isFullscreen && (
          <div className="w-1/3 border-r border-gray-300">
            <ScriptEditor
              script={script}
              onScriptChange={setScript}
            />
          </div>
        )}
        
        {/* Prompter Viewport */}
        <div className="flex-1 relative">
          <PrompterViewport
            script={script}
            settings={settings}
          />
          
          {/* Floating controls when maximized or fullscreen */}
          {(isMaximized || isFullscreen) && (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setShowShortcuts(true)}
                className="bg-gray-800 bg-opacity-70 text-white p-2 rounded hover:bg-opacity-90 transition-opacity"
                title="Show shortcuts (?)"
                aria-label="Show keyboard shortcuts"
              >
                ?
              </button>
              <button
                onClick={toggleMaximize}
                className="bg-gray-800 bg-opacity-70 text-white p-2 rounded hover:bg-opacity-90 transition-opacity"
                title="Restore layout"
                aria-label="Restore layout"
              >
                ⟲
              </button>
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="bg-gray-800 bg-opacity-70 text-white p-2 rounded hover:bg-opacity-90 transition-opacity"
                  title="Exit fullscreen"
                  aria-label="Exit fullscreen"
                >
                  ⊗
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Controls Bar - hidden in fullscreen */}
      {!isFullscreen && (
        <ControlsBar
          settings={settings}
          onSettingChange={updateSetting}
          onShowShortcuts={() => setShowShortcuts(true)}
          onToggleMaximize={toggleMaximize}
          onToggleFullscreen={toggleFullscreen}
          isMaximized={isMaximized}
        />
      )}
      
      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}