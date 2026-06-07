import React, { useState } from 'react';
import { Code, Check, X } from 'lucide-react';
import { buildPrompt } from '../utils/promptBuilder';

interface AIPromptCreatorProps {
  copiedPrompt: boolean;
  setCopiedPrompt: (copied: boolean) => void;
}

export const AIPromptCreator: React.FC<AIPromptCreatorProps> = ({
  copiedPrompt,
  setCopiedPrompt,
}) => {
  const [activePromptTier, setActivePromptTier] = useState<'silver' | 'gold' | 'platinum' | 'typography'>('gold');

  const handleCopyPrompt = () => {
    const text = buildPrompt(activePromptTier);
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-primary-100 p-4 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-1 text-primary-100 dark:text-primary-50">
        <Code className="w-16 h-16 opacity-10" />
      </div>

      <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-1 flex items-center gap-1">
        <Code className="w-3.5 h-3.5 text-primary-500" />
        AI Prompt Creator (Rekomendasi)
      </h4>
      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
        Salin prompt kustom di bawah ini lalu kirimkan ke AI (seperti Gemini) untuk merancang komponen template kustom yang 100% bebas bug.
      </p>

      {/* Package selector tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl mb-3">
        {(['silver', 'gold', 'platinum', 'typography'] as const).map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => setActivePromptTier(tier)}
            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
              activePromptTier === tier
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tier === 'silver' ? '🤍 Silver' : tier === 'gold' ? '👑 Gold' : tier === 'platinum' ? '✨ Platinum' : '📖 Tnp Foto'}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCopyPrompt}
        className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
          copiedPrompt
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 shadow-md'
            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100 shadow-md'
        }`}
      >
        {copiedPrompt ? (
          <>
            <Check className="w-3.5 h-3.5" /> Prompt Berhasil Disalin!
          </>
        ) : (
          <>
            <X className="w-3.5 h-3.5 rotate-45" /> Salin Prompt Pembuatan Template
          </>
        )}
      </button>
    </div>
  );
};
