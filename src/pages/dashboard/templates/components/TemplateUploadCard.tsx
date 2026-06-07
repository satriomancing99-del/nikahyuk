import React from 'react';
import { Upload, Loader2, FileArchive, AlertCircle } from 'lucide-react';

interface TemplateUploadCardProps {
  dragActive: boolean;
  isParsing: boolean;
  parsingError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TemplateUploadCard: React.FC<TemplateUploadCardProps> = ({
  dragActive,
  isParsing,
  parsingError,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFileInputChange,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-primary-500" />
          Unggah File Template
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
          Unggah berkas kustom .zip, config .json, atau kode .jsx.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[110px] ${
          dragActive
            ? 'border-primary-500 bg-primary-50/50 scale-[0.98]'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.json,.jsx"
          onChange={handleFileInputChange}
          className="hidden"
        />
        {isParsing ? (
          <>
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-2" />
            <p className="text-xs font-semibold text-gray-800">Sedang mengekstrak...</p>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center mb-2 text-primary-500">
              <FileArchive className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-gray-800">
              Pilih file atau <span className="text-primary-600 underline">taruh di mana saja</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">ZIP, JSON, JSX</p>
          </>
        )}
      </div>

      {parsingError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{parsingError}</span>
        </div>
      )}
    </div>
  );
};
