import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useBgmManager } from './hooks/useBgmManager';
import { useTemplateUpload } from './hooks/useTemplateUpload';
import { useTemplatesManager } from './hooks/useTemplatesManager';
import { AdminView } from './components/AdminView';
import { ContributorView } from './components/ContributorView';
import { DragDropOverlay } from './components/DragDropOverlay';
import { EditMetadataModal } from './components/EditMetadataModal';
import { MobilePreviewModal } from './components/MobilePreviewModal';
import { Template } from '../../../types/database.types';

const CATEGORIES = ['Classic', 'Rustic', 'Minimalist', 'Modern', 'Islamic', 'Floral', 'Premium', 'Typography'];

export default function TemplatesManager() {
  const { profile } = useAuthStore();
  
  const bgm = useBgmManager();
  const upload = useTemplateUpload();
  const manager = useTemplatesManager();

  const [previewTemplate, setPreviewTemplate] = useState<Template | Partial<Template> | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleSaveDraft = async () => {
    if (upload.draftTemplate) {
      const success = await manager.saveDraftToDatabase(upload.draftTemplate, upload.selectedDraftThumbnailFile);
      if (success) {
        upload.clearDraft();
      }
    }
  };

  const filteredTemplates = manager.existingTemplates.filter((t) => {
    const matchesSearch =
      (t?.name || '').toLowerCase().includes(manager.searchQuery.toLowerCase()) ||
      (t?.slug || '').toLowerCase().includes(manager.searchQuery.toLowerCase());
    const matchesCategory = manager.selectedCategory === 'All' || t?.category === manager.selectedCategory;

    const price = Number(t.price || 0);
    let templatePackage = 'silver';
    if (price > 49000 && price <= 99000) {
      templatePackage = 'gold';
    } else if (price > 99000) {
      templatePackage = 'platinum';
    }

    const matchesPackage = manager.selectedPackage === 'All' || templatePackage === manager.selectedPackage;

    return matchesSearch && matchesCategory && matchesPackage;
  });

  const myContributions = manager.existingTemplates.filter((t) => t.created_by === manager.user?.id);

  if (profile?.role === 'customer' && !manager.collaborationEnabled) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-md border border-amber-200">
          <Lock className="w-10 h-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Akses Kolaborasi Ditutup</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Halo Kreator! Fitur kontribusi dan kolaborasi desain template saat ini sedang dinonaktifkan oleh Administrator platform NikahYuk!.
          </p>
        </div>
        <div className="bg-white border border-gray-150 rounded-2xl p-4 text-xs text-gray-400">
          Hubungi dukungan admin jika Anda memiliki desain template undangan MP3 premium yang ingin diunggah secara publik.
        </div>
      </div>
    );
  }

  return (
    <>
      <DragDropOverlay visible={upload.globalDragActive} />

      {profile?.role === 'super_admin' ? (
        <AdminView
          loading={manager.loading}
          collaborationEnabled={manager.collaborationEnabled}
          handleToggleCollaboration={manager.handleToggleCollaboration}
          loadTemplates={manager.loadTemplates}
          dragActive={upload.dragActive}
          isParsing={upload.isParsing}
          parsingError={upload.parsingError}
          fileInputRef={upload.fileInputRef}
          handleDrag={upload.handleDrag}
          handleDrop={upload.handleDrop}
          handleFileInputChange={upload.handleFileInputChange}
          draftTemplate={upload.draftTemplate}
          draftFiles={upload.draftFiles}
          importType={upload.importType}
          saving={manager.saving}
          categories={CATEGORIES}
          clearDraft={upload.clearDraft}
          handleDraftFieldChange={upload.handleDraftFieldChange}
          handleCustomThumbnailChange={upload.handleCustomThumbnailChange}
          setPreviewTemplate={setPreviewTemplate}
          handleSaveDraftToDatabase={handleSaveDraft}
          copiedPrompt={copiedPrompt}
          setCopiedPrompt={setCopiedPrompt}
          bgmList={bgm.bgmList}
          bgmLoading={bgm.bgmLoading}
          newBgmFile={bgm.newBgmFile}
          newBgmTitle={bgm.newBgmTitle}
          newBgmArtist={bgm.newBgmArtist}
          isBgmUploading={bgm.isBgmUploading}
          playingBgmId={bgm.playingBgmId}
          setNewBgmFile={bgm.setNewBgmFile}
          setNewBgmTitle={bgm.setNewBgmTitle}
          setNewBgmArtist={bgm.setNewBgmArtist}
          loadBgmList={bgm.loadBgmList}
          handleUploadBgm={bgm.handleUploadBgm}
          handleDeleteBgm={bgm.handleDeleteBgm}
          togglePlayBgm={bgm.togglePlayBgm}
          searchQuery={manager.searchQuery}
          setSearchQuery={manager.setSearchQuery}
          selectedCategory={manager.selectedCategory}
          setSelectedCategory={manager.setSelectedCategory}
          selectedPackage={manager.selectedPackage}
          setSelectedPackage={manager.setSelectedPackage}
          filteredTemplates={filteredTemplates}
          handleToggleStatus={manager.handleToggleStatus}
          openEditModal={manager.openEditModal}
          handleDeleteTemplate={manager.handleDeleteTemplate}
        />
      ) : (
        <ContributorView
          user={manager.user}
          loading={manager.loading}
          myContributions={myContributions}
          dragActive={upload.dragActive}
          isParsing={upload.isParsing}
          parsingError={upload.parsingError}
          fileInputRef={upload.fileInputRef}
          handleDrag={upload.handleDrag}
          handleDrop={upload.handleDrop}
          handleFileInputChange={upload.handleFileInputChange}
          draftTemplate={upload.draftTemplate}
          draftFiles={upload.draftFiles}
          importType={upload.importType}
          saving={manager.saving}
          categories={CATEGORIES}
          clearDraft={upload.clearDraft}
          handleDraftFieldChange={upload.handleDraftFieldChange}
          handleCustomThumbnailChange={upload.handleCustomThumbnailChange}
          setPreviewTemplate={setPreviewTemplate}
          handleSaveDraftToDatabase={handleSaveDraft}
          copiedPrompt={copiedPrompt}
          setCopiedPrompt={setCopiedPrompt}
          loadTemplates={manager.loadTemplates}
        />
      )}

      <EditMetadataModal
        editingTemplate={manager.editingTemplate}
        editingName={manager.editingName}
        setEditingName={manager.setEditingName}
        editingPrice={manager.editingPrice}
        setEditingPrice={manager.setEditingPrice}
        editingCategory={manager.editingCategory}
        setEditingCategory={manager.setEditingCategory}
        editingStatus={manager.editingStatus}
        setEditingStatus={manager.setEditingStatus}
        saving={manager.saving}
        categories={CATEGORIES}
        closeEditModal={manager.closeEditModal}
        handleUpdateTemplate={manager.handleUpdateTemplate}
      />

      <MobilePreviewModal
        previewTemplate={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </>
  );
}
