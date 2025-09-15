import { useEffect, useState } from 'react';
import { fetchGoogleDocsContent } from '../lib/notionFetcher';

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
}

export default function ScriptEditor({ script, onScriptChange }: ScriptEditorProps) {
  const [isLoadingGoogleDocs, setIsLoadingGoogleDocs] = useState(false);
  const [googleDocsError, setGoogleDocsError] = useState('');

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (script) {
        localStorage.setItem('teleprompter-script', script);
        localStorage.setItem('teleprompter-script-timestamp', Date.now().toString());
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [script]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedScript = localStorage.getItem('teleprompter-script');
    if (savedScript && !script) { // Only load if current script is empty
      onScriptChange(savedScript);
    }
  }, [onScriptChange, script]);

  // Word and character count
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const charCount = script.length;
  
  // Rough reading time estimate (assuming ~200 words per minute for teleprompter reading)
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 200));


  const handleTelesoufflerScriptLoad = async () => {
    const telesoufflerUrl = 'https://docs.google.com/document/d/1qUiOvvlkHJ2aVxtmnJzFdh53wBC6c-zlEH644ntN95E/edit?tab=t.0';
    
    setIsLoadingGoogleDocs(true);
    setGoogleDocsError('');

    try {
      const content = await fetchGoogleDocsContent(telesoufflerUrl);
      
      // Confirm before replacing existing script
      if (script.trim()) {
        const proceed = confirm(
          `This will replace your current script (${script.split(/\s+/).length} words) ` +
          `with the Telesouffler script "${content.title}" (${content.wordCount} words). Continue?`
        );
        if (!proceed) return;
      }

      onScriptChange(content.content);
      alert(`Successfully loaded Telesouffler script "${content.title}" (${content.wordCount} words)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load Telesouffler script';
      setGoogleDocsError(errorMessage);
    } finally {
      setIsLoadingGoogleDocs(false);
    }
  };


  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex flex-col mb-4">
        <div className="flex items-center space-x-3 mb-2">
          {/* Hexa Logo */}
          <img 
            src="https://cdn.prod.website-files.com/68623ac33982350852c8bf02/68623ac33982350852c8c20f_RUBIK-LONG-LIGHT%20(2).gif"
            alt="Hexa Logo"
            className="h-8 w-auto"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800">Hexa Telesouffleur</h2>
            <p className="text-xs text-gray-500">powered by hexa.com</p>
          </div>
        </div>
      </div>

      {/* Load Telesouffler Script */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Load Telesouffler Script</h3>
        <button
          onClick={handleTelesoufflerScriptLoad}
          disabled={isLoadingGoogleDocs}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded text-sm font-medium transition-colors w-full"
        >
          {isLoadingGoogleDocs ? '🔄 Loading...' : '📄 Load Telesouffler Script'}
        </button>
        {googleDocsError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">Error loading Telesouffler script:</p>
            <p className="text-red-700 text-sm mt-1">{googleDocsError}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Click to load the official Telesouffler script content
        </p>
      </div>

      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder="Paste your script here..."
        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
        spellCheck={false}
        autoComplete="off"
        style={{ whiteSpace: 'pre-wrap' }}
      />

      {/* Stats */}
      <div className="mt-3 text-sm text-gray-600 flex justify-between">
        <span>
          {wordCount.toLocaleString()} words • {charCount.toLocaleString()} chars
        </span>
        <span>
          Est. {estimatedMinutes} min read
        </span>
      </div>

    </div>
  );
}