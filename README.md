# Teleprompter

A modern, professional web-based teleprompter application built with React, TypeScript, and Vite. Designed for speakers, presenters, and content creators who need smooth, reliable script scrolling with professional controls.

## 🚀 Features

### Core Functionality
- **Smooth Scrolling Engine** - Frame-accurate scrolling using `requestAnimationFrame` with GPU acceleration
- **Variable Speed Control** - 10-speed settings (1-10) with exponential curve mapping for fine control
- **Mirror/Reverse Mode** - Horizontal text flipping for teleprompter hardware setups
- **Fullscreen Support** - Native fullscreen API integration for distraction-free reading

### Professional Controls
- **Keyboard Shortcuts** - Space (play/pause), arrows (speed), Home/End (jump), F (fullscreen)
- **Inline Settings** - Real-time adjustment of font size, margins, colors, and speed
- **Setup Presets** - Quick configuration with width/height/mirror/font/color presets
- **WPM Estimation** - Real-time words-per-minute calculation based on scroll speed

### User Experience
- **Accessible Design** - Full keyboard navigation, screen reader support, focus management
- **High Contrast Themes** - Multiple color schemes including high-contrast options
- **Responsive Layout** - Works on desktop and tablet devices
- **Settings Persistence** - Automatic saving to localStorage and URL parameters
- **Internationalization** - Multi-language support structure (English/French included)

### Technical Excellence
- **TypeScript** - Full type safety and IntelliSense support
- **Modern React** - Hooks, context, and modern patterns
- **Performance Optimized** - GPU-accelerated transforms and efficient re-renders
- **Error Boundaries** - Graceful error handling and recovery

## 🎯 Use Cases

- **Public Speaking** - Conferences, presentations, speeches
- **Content Creation** - YouTube videos, podcasts, livestreams  
- **Broadcasting** - News, interviews, teleprompter setups
- **Theater & Film** - Script reading, rehearsals, productions

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type checking

## 🔧 Architecture

```
src/
├── routes/
│   ├── setup.tsx      # Setup/configuration screen
│   └── prompter.tsx   # Main prompter interface
├── components/
│   ├── ControlsBar.tsx      # Bottom control panel
│   ├── ScriptEditor.tsx     # Text input area
│   ├── PrompterViewport.tsx # Scrolling display area
│   ├── SettingsPanel.tsx    # Settings configuration
│   └── ShortcutsModal.tsx   # Keyboard shortcuts help
├── store/
│   ├── settings.ts    # Settings state management
│   └── playback.ts    # Playback state management  
├── lib/
│   ├── scrollEngine.ts       # Core scrolling logic
│   ├── timeEstimates.ts      # WPM and duration calculations
│   ├── useKeyboardControls.ts # Keyboard event handling
│   └── useFullscreen.ts      # Fullscreen API integration
└── i18n/              # Internationalization files
```

## ⌨️ Keyboard Shortcuts

- **Space** - Play/Pause scrolling
- **↑/↓** - Increase/decrease scroll speed
- **Home/PgUp** - Jump to beginning
- **End/PgDn** - Jump to end  
- **F** - Toggle fullscreen
- **?** - Show shortcuts modal

## 🎨 Customization

### Themes & Colors
- Light, dark, and high-contrast presets
- Custom text and background color selection
- System dark mode detection

### Layout Options  
- Adjustable margins (0-40%)
- Variable font sizes (12-72px)
- Multiple width presets (narrow/wide/max)

## 🌍 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

Requires support for ES2020, CSS Grid, and Fullscreen API.

## 📜 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

---

**Built with modern web technologies for professional teleprompter needs.**
