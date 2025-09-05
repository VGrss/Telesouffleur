import { usePlaybackStore } from '../store/playback';
import { getWPMForSpeed } from '../lib/timeEstimates';

interface ControlsBarProps {
  settings: {
    speed: number;
    fontSize: number;
    margin: number;
    textColor: string;
    backgroundColor: string;
    mirror: boolean;
  };
  onSettingChange: (key: string, value: any) => void;
  onShowShortcuts?: () => void;
  onToggleMaximize?: () => void;
  onToggleFullscreen?: () => void;
  isMaximized?: boolean;
}

export default function ControlsBar({ 
  settings, 
  onSettingChange,
  onShowShortcuts,
  onToggleMaximize,
  onToggleFullscreen,
  isMaximized 
}: ControlsBarProps) {
  const { 
    isPlaying, 
    toggle, 
    stop, 
    setSpeed,
    jumpToTop,
    jumpToEnd,
    position 
  } = usePlaybackStore();

  const handleSpeedChange = (newSpeed: number) => {
    onSettingChange('speed', newSpeed);
    setSpeed(newSpeed);
  };

  // Format position for display and calculate speed info
  const formatPosition = (pos: number) => {
    return Math.round(pos).toString() + 'px';
  };

  const currentWPM = getWPMForSpeed(settings.speed);

  return (
    <div className="bg-gray-800 text-white p-4 flex items-center space-x-6 overflow-x-auto">
      {/* Play/Pause Button */}
      <button 
        onClick={toggle}
        className={`px-4 py-2 rounded font-semibold transition-colors ${
          isPlaying 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* Stop Button */}
      <button 
        onClick={stop}
        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold transition-colors"
      >
        ⏹ Stop
      </button>
      
      {/* Speed Control */}
      <div className="flex items-center space-x-2">
        <label>Speed:</label>
        <button 
          onClick={() => handleSpeedChange(Math.max(1, settings.speed - 1))}
          className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          -
        </button>
        <input
          type="range"
          min="1"
          max="10"
          value={settings.speed}
          onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
          className="w-20"
        />
        <button 
          onClick={() => handleSpeedChange(Math.min(10, settings.speed + 1))}
          className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          +
        </button>
        <span className="min-w-[2ch]">{settings.speed}</span>
        <span className="text-xs text-gray-400">({currentWPM} WPM)</span>
      </div>
      
      {/* Jump Controls */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={jumpToTop}
          className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded"
          title="Jump to top (Home)"
        >
          ⏮
        </button>
        <button 
          onClick={jumpToEnd}
          className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded"
          title="Jump to end (End)"
        >
          ⏭
        </button>
      </div>

      {/* Font Size */}
      <div className="flex items-center space-x-2">
        <label>Font:</label>
        <button 
          onClick={() => onSettingChange('fontSize', Math.max(12, settings.fontSize - 2))}
          className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          -
        </button>
        <input
          type="number"
          min="12"
          max="72"
          value={settings.fontSize}
          onChange={(e) => onSettingChange('fontSize', parseInt(e.target.value))}
          className="w-16 px-2 py-1 text-black rounded"
        />
        <button 
          onClick={() => onSettingChange('fontSize', Math.min(72, settings.fontSize + 2))}
          className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          +
        </button>
        <span>px</span>
      </div>
      
      {/* Margin */}
      <div className="flex items-center space-x-2">
        <label>Margin:</label>
        <input
          type="range"
          min="0"
          max="40"
          value={settings.margin}
          onChange={(e) => onSettingChange('margin', parseInt(e.target.value))}
          className="w-20"
        />
        <span className="min-w-[3ch]">{settings.margin}%</span>
      </div>
      
      {/* Mirror Toggle */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={settings.mirror}
          onChange={(e) => onSettingChange('mirror', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Mirror</span>
      </label>
      
      {/* Colors */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label>Text:</label>
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => onSettingChange('textColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label>Background:</label>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onSettingChange('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center space-x-2">
        {onShowShortcuts && (
          <button
            onClick={onShowShortcuts}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
            title="Show keyboard shortcuts"
          >
            ? Shortcuts
          </button>
        )}
        {onToggleMaximize && (
          <button
            onClick={onToggleMaximize}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
            title={isMaximized ? "Restore layout" : "Maximize text area"}
          >
            {isMaximized ? "⟲ Restore" : "⤢ Maximize"}
          </button>
        )}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm"
            title="Toggle fullscreen (F)"
          >
            ⛶ Fullscreen
          </button>
        )}
      </div>

      {/* Position Display */}
      <div className="flex items-center space-x-2 text-sm">
        <span>Position: {formatPosition(position)}</span>
      </div>
    </div>
  );
}