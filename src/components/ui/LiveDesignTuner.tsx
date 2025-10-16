'use client';

import { useState } from 'react';

interface LiveDesignTunerProps {
  isTuning: boolean;
  onTune: (prompt: string) => Promise<void>;
}

export default function LiveDesignTuner({ isTuning, onTune }: LiveDesignTunerProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isTuning) return;
    onTune(prompt);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-50">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Try 'make the headings blue' or 'use a more formal font'..."
          className="w-full p-4 pr-28 rounded-full shadow-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          disabled={isTuning}
        />
        <button
          type="submit"
          disabled={isTuning || !prompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition-all transform hover:scale-105 disabled:scale-100"
        >
          {isTuning ? 'Tuning...' : 'Tune'}
        </button>
      </form>
    </div>
  );
}
