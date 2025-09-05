import { useI18n, Locale } from '../i18n';
import { useSettings, applyTheme, Theme } from '../store/settings';
import { useEffect } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, highContrast, reducedMotion, setTheme, setHighContrast, setReducedMotion } = useSettings();

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme, highContrast);
  }, [theme, highContrast]);

  // Handle escape key
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 theme-high-contrast:bg-black theme-high-contrast:border theme-high-contrast:border-white">
        <div className="flex justify-between items-center mb-4">
          <h2 id="settings-title" className="text-2xl font-bold text-gray-800 theme-high-contrast:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none theme-high-contrast:text-white theme-high-contrast:hover:text-yellow-400"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 theme-high-contrast:text-white mb-2">
              Language / Langue
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 theme-high-contrast:bg-black theme-high-contrast:text-white theme-high-contrast:border-white"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 theme-high-contrast:text-white mb-2">
              Theme
            </label>
            <div className="space-y-2">
              {[
                { value: 'light' as Theme, label: 'Light' },
                { value: 'dark' as Theme, label: 'Dark' },
                { value: 'high-contrast' as Theme, label: 'High Contrast' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={theme === value}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 theme-high-contrast:text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 theme-high-contrast:text-white mb-2">
              Accessibility
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700 theme-high-contrast:text-white">High Contrast</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700 theme-high-contrast:text-white">Reduce Motion</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded theme-high-contrast:bg-yellow-500 theme-high-contrast:text-black theme-high-contrast:hover:bg-yellow-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}