import { useEffect, useRef } from 'react';

interface ScriptEditorProps {
  script: string;
  onScriptChange: (script: string) => void;
}

export default function ScriptEditor({ script, onScriptChange }: ScriptEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the script?')) {
      onScriptChange('');
      localStorage.removeItem('teleprompter-script');
      localStorage.removeItem('teleprompter-script-timestamp');
    }
  };

  const handleDownload = () => {
    if (!script.trim()) {
      alert('No script to download');
      return;
    }

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teleprompter-script-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        // Check file size (warn if > 300k chars)
        if (content.length > 300000) {
          const proceed = confirm(
            `This file is quite large (${content.length.toLocaleString()} characters). ` +
            'Large files may affect performance. Continue loading?'
          );
          if (!proceed) return;
        }
        onScriptChange(content);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Script Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleImportClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            title="Import text file"
          >
            📁 Import
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            title="Download as text file"
            disabled={!script.trim()}
          >
            💾 Download
          </button>
          <button
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            title="Clear script"
            disabled={!script.trim()}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder="Paste your script here..."
        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        spellCheck={false}
        autoComplete="off"
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.text"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
}