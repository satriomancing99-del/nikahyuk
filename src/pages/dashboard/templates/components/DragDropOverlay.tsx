import React from 'react';
import { Upload } from 'lucide-react';

interface DragDropOverlayProps {
  visible: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-primary-600/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white pointer-events-none transition-all duration-300 animate-in fade-in">
      <div className="p-8 rounded-full bg-white/10 border border-white/25 animate-bounce mb-4">
        <Upload className="w-16 h-16 text-white" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight">Lepaskan Berkas Template Anda</h2>
      <p className="text-sm text-primary-100 mt-2 font-medium">ZIP paket kustom, config JSON, atau file JSX</p>
    </div>
  );
};
