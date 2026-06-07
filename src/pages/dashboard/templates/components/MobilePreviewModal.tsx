import React from 'react';
import { X } from 'lucide-react';
import { Template } from '../../../../types/database.types';

interface MobilePreviewModalProps {
  previewTemplate: Template | Partial<Template> | null;
  onClose: () => void;
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  previewTemplate,
  onClose,
}) => {
  if (!previewTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 w-full h-[90vh] flex flex-col transition-all duration-300 z-10 cursor-default max-w-sm">
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
          <span className="text-xs font-bold">Simulator Smartphone</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
          <iframe
            title="Mobile Viewport"
            src={`/preview/${previewTemplate.slug || 'classic'}`}
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
