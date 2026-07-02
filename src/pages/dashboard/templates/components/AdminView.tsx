import React from 'react';
import { Sparkles, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Template } from '../../../../types/database.types';
import { TemplateUploadCard } from './TemplateUploadCard';
import { AIPromptCreator } from './AIPromptCreator';
import { BgmManagerCard } from './BgmManagerCard';
import { SandboxDraftCard } from './SandboxDraftCard';
import { TemplatesFilter } from './TemplatesFilter';
import { TemplatesGrid } from './TemplatesGrid';

interface AdminViewProps {
  loading: boolean;
  collaborationEnabled: boolean;
  handleToggleCollaboration: () => void;
  loadTemplates: () => void;
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
  
  bgmList: any[];
  bgmLoading: boolean;
  stagedBgms: any[];
  isBgmUploading: boolean;
  playingBgmId: string | null;
  addStagedBgms: (files: FileList | File[]) => Promise<void>;
  updateStagedBgm: (id: string, updates: Partial<{ title: string; artist: string }>) => void;
  removeStagedBgm: (id: string) => void;
  clearStagedBgms: () => void;
  loadBgmList: () => void;
  handleUploadBgm: (e: React.FormEvent) => void;
  handleDeleteBgm: (id: string, fileUrl: string) => void;
  togglePlayBgm: (id: string, url: string) => void;

  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedPackage: string;
  setSelectedPackage: (val: string) => void;
  filteredTemplates: Template[];
  handleToggleStatus: (tpl: Template) => void;
  openEditModal: (tpl: Template) => void;
  handleDeleteTemplate: (id: string, name: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  loading,
  collaborationEnabled,
  handleToggleCollaboration,
  loadTemplates,
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
  
  bgmList,
  bgmLoading,
  stagedBgms,
  isBgmUploading,
  playingBgmId,
  addStagedBgms,
  updateStagedBgm,
  removeStagedBgm,
  clearStagedBgms,
  loadBgmList,
  handleUploadBgm,
  handleDeleteBgm,
  togglePlayBgm,

  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPackage,
  setSelectedPackage,
  filteredTemplates,
  handleToggleStatus,
  openEditModal,
  handleDeleteTemplate,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengelola Template Undangan</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200">
              Admin & Editor
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Impor template undangan buatan sendiri berupa ZIP, JSON, atau JSX, lalu pratinjau dan unggah ke database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleCollaboration}
            className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm border ${
              collaborationEnabled
                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                : 'bg-amber-100 text-amber-800 border-amber-250 hover:bg-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            Kontribusi Kustomer: {collaborationEnabled ? 'AKTIF (ON)' : 'MATI (OFF)'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" /> Unggah Template
          </button>
          <button
            type="button"
            onClick={loadTemplates}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan Data
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

          <AIPromptCreator copiedPrompt={copiedPrompt} setCopiedPrompt={setCopiedPrompt} />

          <BgmManagerCard
            bgmList={bgmList}
            bgmLoading={bgmLoading}
            stagedBgms={stagedBgms}
            isBgmUploading={isBgmUploading}
            playingBgmId={playingBgmId}
            addStagedBgms={addStagedBgms}
            updateStagedBgm={updateStagedBgm}
            removeStagedBgm={removeStagedBgm}
            clearStagedBgms={clearStagedBgms}
            loadBgmList={loadBgmList}
            handleUploadBgm={handleUploadBgm}
            handleDeleteBgm={handleDeleteBgm}
            togglePlayBgm={togglePlayBgm}
          />
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

          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
            <TemplatesFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              categories={categories}
            />

            {loading ? (
              <div className="p-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400 font-semibold">Memuat daftar template aktif...</p>
              </div>
            ) : (
              <TemplatesGrid
                filteredTemplates={filteredTemplates}
                handleToggleStatus={handleToggleStatus}
                openEditModal={openEditModal}
                handleDeleteTemplate={handleDeleteTemplate}
                setPreviewTemplate={setPreviewTemplate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
