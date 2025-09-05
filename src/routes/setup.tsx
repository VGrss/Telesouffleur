import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SetupSettings {
  width: 'narrow' | 'wide' | 'max';
  height: 'high' | 'low';
  mirror: 'normal' | 'mirrored';
  fontSize: 'big' | 'small';
  colorPreset: 'light' | 'dark' | 'high-contrast';
}

export default function Setup() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SetupSettings>({
    width: 'wide',
    height: 'high',
    mirror: 'normal',
    fontSize: 'big',
    colorPreset: 'light',
  });

  const handleContinue = () => {
    const params = new URLSearchParams({
      width: settings.width,
      height: settings.height,
      mirror: settings.mirror === 'mirrored' ? '1' : '0',
      fontSize: settings.fontSize,
      colorPreset: settings.colorPreset,
    });
    navigate(`/prompter?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Teleprompter Setup
        </h1>

        <div className="space-y-8">
          {/* Width */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Prompter Width
            </h3>
            <div className="flex flex-col space-y-2">
              {['narrow', 'wide', 'max'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="width"
                    value={option}
                    checked={settings.width === option}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        width: e.target.value as SetupSettings['width'],
                      })
                    }
                    className="mr-2"
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Prompter Height
            </h3>
            <div className="flex flex-col space-y-2">
              {['high', 'low'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="height"
                    value={option}
                    checked={settings.height === option}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        height: e.target.value as SetupSettings['height'],
                      })
                    }
                    className="mr-2"
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mirror */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Reverse Mirror
            </h3>
            <div className="flex flex-col space-y-2">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'mirrored', label: 'Mirrored' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="mirror"
                    value={value}
                    checked={settings.mirror === value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mirror: e.target.value as SetupSettings['mirror'],
                      })
                    }
                    className="mr-2"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Font Size
            </h3>
            <div className="flex flex-col space-y-2">
              {['big', 'small'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="fontSize"
                    value={option}
                    checked={settings.fontSize === option}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fontSize: e.target.value as SetupSettings['fontSize'],
                      })
                    }
                    className="mr-2"
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Colors</h3>
            <div className="flex flex-col space-y-2">
              {[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'high-contrast', label: 'High Contrast' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="colorPreset"
                    value={value}
                    checked={settings.colorPreset === value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colorPreset: e.target
                          .value as SetupSettings['colorPreset'],
                      })
                    }
                    className="mr-2"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}