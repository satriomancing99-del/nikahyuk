import React from 'react';
import { Sparkles, Plus, RefreshCw, Palette, Eye, Loader2 } from 'lucide-react';
import { Template } from '../../../../types/database.types';
import { TemplateUploadCard } from './TemplateUploadCard';
import { ContributorInstructions } from './ContributorInstructions';
import { SandboxDraftCard } from './SandboxDraftCard';
import { AIPromptCreator } from './AIPromptCreator';
import { getTemplateThumbnail } from '../../../../utils/templateThumbnails';

interface ContributorViewProps {
  user: any;
  loading: boolean;
  myContributions: Template[];
  dragActive: boolean;
  isParsing: boolean;
  parsingError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  draftTemplate: Partial<Template> | null;
  draftFiles: any[];
  importType: any;
  saving: boolean;
  categories: string[];
  clearDraft: () => void;
  handleDraftFieldChange: (field: keyof Template, value: any) => void;
  handleCustomThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPreviewTemplate: (tpl: Template | Partial<Template> | null) => void;
  handleSaveDraftToDatabase: () => void;
  copiedPrompt: boolean;
  setCopiedPrompt: (copied: boolean) => void;
  loadTemplates: () => void;
}

export const ContributorView: React.FC<ContributorViewProps> = ({
  user,
  loading,
  myContributions,
  dragActive,
  isParsing,
  parsingError,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFileInputChange,
  draftTemplate,
  draftFiles,
  importType,
  saving,
  categories,
  clearDraft,
  handleDraftFieldChange,
  handleCustomThumbnailChange,
  setPreviewTemplate,
  handleSaveDraftToDatabase,
  copiedPrompt,
  setCopiedPrompt,
  loadTemplates,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel Kontributor Template</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-250 flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" /> Kreator Aktif
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Bantu platform berkembang secara masif! Buat template undangan digital romantis premium menggunakan ChatGPT, lakukan kompilasi, uji sandbox, lalu ajukan review ke Admin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" /> Unggah Berkas Template
          </button>
          <button
            type="button"
            onClick={loadTemplates}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan Status
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <TemplateUploadCard
            dragActive={dragActive}
            isParsing={isParsing}
            parsingError={parsingError}
            fileInputRef={fileInputRef}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleFileInputChange={handleFileInputChange}
          />
          <ContributorInstructions />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <SandboxDraftCard
            draftTemplate={draftTemplate}
            draftFiles={draftFiles}
            importType={importType}
            saving={saving}
            categories={categories}
            clearDraft={clearDraft}
            handleDraftFieldChange={handleDraftFieldChange}
            handleCustomThumbnailChange={handleCustomThumbnailChange}
            setPreviewTemplate={setPreviewTemplate}
            handleSaveDraftToDatabase={handleSaveDraftToDatabase}
          />

          <AIPromptCreator copiedPrompt={copiedPrompt} setCopiedPrompt={setCopiedPrompt} />

          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-primary-500" />
              Daftar Kontribusi Desain Anda ({myContributions.length})
            </h3>

            {loading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400">Memuat data kontribusi...</p>
              </div>
            ) : myContributions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-gray-50/50">
                <Palette className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Belum ada kontribusi template</p>
                <p className="text-xs text-gray-400 mt-0.5">Mulai dengan mengunggah template pertama Anda menggunakan petunjuk di atas!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {myContributions.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={getTemplateThumbnail(tpl.slug, tpl.category, tpl.price, tpl.name) || getTemplateThumbnail('classic-silver')}
                        alt={tpl.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-1 items-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 shadow-sm text-gray-850">
                          {tpl.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tpl.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-250'
                          }`}>
                          {tpl.status === 'active' ? 'Aktif (Disetujui)' : 'Draf (Review Admin)'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-white uppercase">
                          Rp {Number(tpl.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-55 border-t border-gray-150 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{tpl.name}</span>
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="text-primary-600 hover:text-primary-700 text-[10px] font-bold flex items-center gap-0.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Pratinjau
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
