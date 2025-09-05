import { useEffect } from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: 'Play / Pause' },
    { key: '↑ / ↓', description: 'Increase / Decrease speed' },
    { key: 'Home / PgUp', description: 'Jump to top' },
    { key: 'End / PgDn', description: 'Jump to end' },
    { key: 'F', description: 'Toggle fullscreen' },
    { key: 'F11', description: 'Browser fullscreen' },
    { key: 'Escape', description: 'Close modals' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close shortcuts"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map(({ key, description }, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                {key}
              </span>
              <span className="text-gray-700">{description}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}