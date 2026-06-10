import React, { useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Check, Loader2 } from 'lucide-react';
import { useInvitationEditor } from './hooks/useInvitationEditor';
import { ThemeSelectorStep } from './components/FormSteps/ThemeSelectorStep';
import { BrideGroomStep } from './components/FormSteps/BrideGroomStep';
import { EventScheduleStep } from './components/FormSteps/EventScheduleStep';
import { GalleryUploadStep } from './components/FormSteps/GalleryUploadStep';
import { GiftRegistryStep } from './components/FormSteps/GiftRegistryStep';
import { SlugConfigStep } from './components/FormSteps/SlugConfigStep';
import { ImageCropperModal } from './components/ImageCropperModal';
import { base64ToFile } from './utils/editorHelpers';
import { templateService, invitationService, eventService, giftService, mediaService, storageService } from '../../../services';
import { supabase } from '../../../lib/supabase';

export default function InvitationEditor() {
  const editor = useInvitationEditor();
  const {
    navigate, editId, user, profile, activePackage, activeStep, setActiveStep, loading, setLoading,
    fetchingTemplates, setFetchingTemplates, templates, setTemplates, selectedTemplate, setSelectedTemplate,
    selectedReligion, setSelectedReligion, customSlug, setCustomSlug, slugExists,
    checkingSlug, hasRestoredDraft, setHasRestoredDraft, isDataLoaded, setIsDataLoaded,
    mempelai, setMempelai, eventAkad, setEventAkad, eventResepsi, setEventResepsi, giftsList, setGiftsList,
    waThumbnail, setWaThumbnail, waThumbnailUrl, setWaThumbnailUrl, groomPhotoFile, setGroomPhotoFile,
    bridePhotoFile, setBridePhotoFile, groomPhotoPreview, setGroomPhotoPreview, bridePhotoPreview, setBridePhotoPreview,
    galleryItems, setGalleryItems, showCropper, setShowCropper, cropperType, setCropperType,
    cropperImageSrc, setCropperImageSrc
  } = editor;

  // Restore autosaved draft (or load db data if editing) on start
  useEffect(() => {
    if (!user) return;
    if (editId) {
      setLoading(true);
      const savedEditDraft = localStorage.getItem(`nikahyuk_edit_draft_${editId}`);
      if (savedEditDraft) {
        try {
          const draft = JSON.parse(savedEditDraft);
          if (draft.activeStep) setActiveStep(draft.activeStep);
          if (draft.mempelai) setMempelai(draft.mempelai);
          if (draft.eventAkad) setEventAkad(draft.eventAkad);
          if (draft.eventResepsi) setEventResepsi(draft.eventResepsi);
          if (draft.giftsList) setGiftsList(draft.giftsList);
          if (draft.customSlug) setCustomSlug(draft.customSlug);
          if (draft.waThumbnailUrl) setWaThumbnailUrl(draft.waThumbnailUrl);
          if (draft.groomPhotoPreview) setGroomPhotoPreview(draft.groomPhotoPreview);
          if (draft.bridePhotoPreview) setBridePhotoPreview(draft.bridePhotoPreview);
          if (draft.galleryItemsPreviews) {
            setGalleryItems(draft.galleryItemsPreviews.map((preview: string, idx: number) => ({
              file: null as any, preview, caption: draft.galleryItemsCaptions?.[idx] || 'Foto Galeri'
            })));
          }
          setHasRestoredDraft(true);
          setLoading(false);
          setIsDataLoaded(true);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      
      const loadInvitationData = async () => {
        try {
          const { data: inv, error } = await supabase.from('invitations').select('*').eq('id', editId).single();
          if (error || !inv) return;
          setMempelai({
            groom_name: inv.groom_name || '', groom_parent: inv.groom_parent || '',
            bride_name: inv.bride_name || '', bride_parent: inv.bride_parent || '',
            quote: inv.quote || '', greeting: inv.greeting || "Assalamu'alaikum Wr. Wb",
            love_story: inv.love_story || '', music_url: inv.music_url || ''
          });
          setCustomSlug(inv.slug || '');
          if (inv.thumbnail_url) setWaThumbnailUrl(inv.thumbnail_url);

          const { data: evts } = await supabase.from('events').select('*').eq('invitation_id', editId);
          if (evts) {
            const akad = evts.find(e => e.type === 'akad');
            if (akad) setEventAkad({
              title: akad.title || 'Akad Nikah', date: akad.date || '',
              start_time: akad.start_time?.slice(0, 5) || '09:00', end_time: akad.end_time?.slice(0, 5) || '11:00',
              location_name: akad.location_name || '', address: akad.address || '', google_maps_url: akad.google_maps_url || ''
            });
            const resepsi = evts.find(e => e.type === 'resepsi');
            if (resepsi) setEventResepsi({
              title: resepsi.title || 'Resepsi Pernikahan', date: resepsi.date || '',
              start_time: resepsi.start_time?.slice(0, 5) || '11:30', end_time: resepsi.end_time?.slice(0, 5) || '14:00',
              location_name: resepsi.location_name || '', address: resepsi.address || '', google_maps_url: resepsi.google_maps_url || ''
            });
          }

          const { data: gfts } = await supabase.from('gifts').select('*').eq('invitation_id', editId);
          if (gfts && gfts.length > 0) setGiftsList(gfts.map(g => ({
            type: g.type || 'Bank', bank_name: g.bank_name || 'BCA', account_number: g.account_number || '',
            account_name: g.account_name || '', ewallet_name: g.ewallet_name || 'GoPay', address: g.address || ''
          })));

          const { data: media } = await supabase.from('media').select('*').eq('invitation_id', editId);
          if (media) {
            const gr = media.find(m => m.caption === 'groom_photo');
            if (gr) setGroomPhotoPreview(gr.url);
            const br = media.find(m => m.caption === 'bride_photo');
            if (br) setBridePhotoPreview(br.url);
            setGalleryItems(media.filter(m => m.caption !== 'groom_photo' && m.caption !== 'bride_photo').map(m => ({
              file: null as any, preview: m.url, caption: m.caption || 'Foto Galeri'
            })));
          }
          setIsDataLoaded(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadInvitationData();
    } else {
      const savedDraft = localStorage.getItem('nikahyuk_creation_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.activeStep) setActiveStep(draft.activeStep);
          if (draft.mempelai) setMempelai(draft.mempelai);
          if (draft.eventAkad) setEventAkad(draft.eventAkad);
          if (draft.eventResepsi) setEventResepsi(draft.eventResepsi);
          if (draft.giftsList) setGiftsList(draft.giftsList);
          if (draft.customSlug) setCustomSlug(draft.customSlug);
          if (draft.waThumbnailUrl) setWaThumbnailUrl(draft.waThumbnailUrl);
          if (draft.groomPhotoPreview) setGroomPhotoPreview(draft.groomPhotoPreview);
          if (draft.bridePhotoPreview) setBridePhotoPreview(draft.bridePhotoPreview);
          if (draft.galleryItemsPreviews) {
            setGalleryItems(draft.galleryItemsPreviews.map((preview: string, idx: number) => ({
              file: null as any, preview, caption: draft.galleryItemsCaptions?.[idx] || 'Foto Galeri'
            })));
          }
          setHasRestoredDraft(true);
        } catch (e) {
          console.error(e);
        }
      }
      setIsDataLoaded(true);
    }
  }, [editId, user]);

  // Handle template selection restoration
  useEffect(() => {
    if (!isDataLoaded) return;
    templateService.getAll().then(list => {
      const activeTemplates = list.filter(t => t.status === 'active');
      setTemplates(activeTemplates);
      
      const savedEditDraft = localStorage.getItem(`nikahyuk_edit_draft_${editId}`);
      const savedDraft = localStorage.getItem('nikahyuk_creation_draft');
      let restoredTpl = null;
      
      if (editId) {
        let selectedTplId = null;
        if (savedEditDraft) {
          try {
            const draft = JSON.parse(savedEditDraft);
            selectedTplId = draft.selectedTemplateId;
          } catch(e) {}
        }
        if (selectedTplId) {
          restoredTpl = activeTemplates.find(t => t.id === selectedTplId);
        }
      } else if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.selectedTemplateId) {
            restoredTpl = activeTemplates.find(t => t.id === draft.selectedTemplateId);
          }
        } catch(e) {}
      }
      if (restoredTpl) setSelectedTemplate(restoredTpl);
      setFetchingTemplates(false);
    }).catch(err => {
      console.error("Error fetching templates:", err);
      setFetchingTemplates(false);
    });
  }, [isDataLoaded]);

  // Autosave Draft restored banner helpers
  const handleClearDraft = () => {
    if (editId) {
      if (window.confirm('Reset draf suntingan ke data asli?')) {
        localStorage.removeItem(`nikahyuk_edit_draft_${editId}`);
        window.location.reload();
      }
      return;
    }
    if (window.confirm('Mulai ulang dari awal?')) {
      localStorage.removeItem('nikahyuk_creation_draft');
      setMempelai({
        groom_name: '', groom_parent: '', bride_name: '', bride_parent: '',
        quote: 'Dan di antara tanda-tanda (kebesaran)-Nya...', greeting: "Assalamu'alaikum Wr. Wb", love_story: '', music_url: ''
      });
      setEventAkad({ title: 'Akad Nikah', date: '', start_time: '09:00', end_time: '11:00', location_name: '', address: '', google_maps_url: '' });
      setEventResepsi({ title: 'Resepsi Pernikahan', date: '', start_time: '11:30', end_time: '14:00', location_name: '', address: '', google_maps_url: '' });
      setGiftsList([{ type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }]);
      setCustomSlug('');
      setActiveStep(1);
      setHasRestoredDraft(false);
      setWaThumbnail(null);
      setWaThumbnailUrl('');
      setGroomPhotoFile(null);
      setGroomPhotoPreview('');
      setBridePhotoFile(null);
      setBridePhotoPreview('');
      setGalleryItems([]);
    }
  };

  // Local storage auto save triggers (Create / Edit)
  useEffect(() => {
    if (fetchingTemplates || !isDataLoaded) return;
    const draftData = {
      activeStep, selectedTemplateId: selectedTemplate?.id || null, mempelai, eventAkad, eventResepsi, giftsList, customSlug, waThumbnailUrl, groomPhotoPreview, bridePhotoPreview,
      galleryItemsPreviews: galleryItems.map(item => item.preview), galleryItemsCaptions: galleryItems.map(item => item.caption),
    };
    try {
      localStorage.setItem(editId ? `nikahyuk_edit_draft_${editId}` : 'nikahyuk_creation_draft', JSON.stringify(draftData));
    } catch(e) {}
  }, [activeStep, selectedTemplate, mempelai, eventAkad, eventResepsi, giftsList, customSlug, editId, fetchingTemplates, isDataLoaded, waThumbnailUrl, groomPhotoPreview, bridePhotoPreview, galleryItems]);

  const getStepError = (): string | null => {
    if (activeStep === 1 && !selectedTemplate) return 'Pilih desain template terlebih dahulu.';
    if (activeStep === 2) {
      if (!mempelai.groom_name.trim()) return 'Nama mempelai pria wajib diisi.';
      if (!mempelai.groom_parent.trim()) return 'Nama orang tua mempelai pria wajib diisi.';
      if (!mempelai.bride_name.trim()) return 'Nama mempelai wanita wajib diisi.';
      if (!mempelai.bride_parent.trim()) return 'Nama orang tua mempelai wanita wajib diisi.';
    }
    if (activeStep === 3) {
      if (!eventAkad.date || !eventAkad.location_name.trim() || !eventAkad.address.trim()) return 'Lengkapi detail Akad Nikah.';
      if (!eventResepsi.date || !eventResepsi.location_name.trim() || !eventResepsi.address.trim()) return 'Lengkapi detail Resepsi.';
    }
    if (activeStep === 5) {
      if (activePackage === 'silver' && profile?.role !== 'super_admin') return null;
      for (let i = 0; i < giftsList.length; i++) {
        const g = giftsList[i];
        if (g.type === 'Bank' && (!g.bank_name || !g.account_number.trim() || !g.account_name.trim())) return `Lengkapi detail bank baris ${i + 1}.`;
        if (g.type === 'E-Wallet' && (!g.ewallet_name || !g.account_number.trim() || !g.account_name.trim())) return `Lengkapi detail e-wallet baris ${i + 1}.`;
        if (g.type === 'Kirim Kado' && !g.address.trim()) return `Lengkapi alamat kado baris ${i + 1}.`;
      }
    }
    if (activeStep === 6) {
      if (!customSlug.trim()) return 'Link URL undangan wajib diisi.';
      if (slugExists) return 'Link URL sudah digunakan pasangan lain.';
    }
    return null;
  };

  const handleNext = () => {
    const err = getStepError();
    if (err) { alert(err); return; }
    setActiveStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const handlePreviewNewTab = () => {
    if (!selectedTemplate) return alert("Pilih desain template terlebih dahulu.");
    localStorage.setItem('draft_invitation_preview', JSON.stringify({
      invitation: { groom_name: mempelai.groom_name, bride_name: mempelai.bride_name, greeting: mempelai.greeting, quote: mempelai.quote, love_story: mempelai.love_story, thumbnail_url: waThumbnailUrl || selectedTemplate.thumbnail_url, status: 'draft' },
      events: [
        { type: 'akad', title: eventAkad.title, date: eventAkad.date, start_time: eventAkad.start_time, end_time: eventAkad.end_time, location_name: eventAkad.location_name, address: eventAkad.address, google_maps_url: eventAkad.google_maps_url },
        { type: 'resepsi', title: eventResepsi.title, date: eventResepsi.date, start_time: eventResepsi.start_time, end_time: eventResepsi.end_time, location_name: eventResepsi.location_name, address: eventResepsi.address, google_maps_url: eventResepsi.google_maps_url }
      ],
      gifts: giftsList,
      gallery: [
        ...(groomPhotoPreview ? [{ url: groomPhotoPreview, caption: 'groom_photo' }] : []),
        ...(bridePhotoPreview ? [{ url: bridePhotoPreview, caption: 'bride_photo' }] : []),
        ...galleryItems.map(item => ({ url: item.preview, caption: item.caption }))
      ],
      template: { slug: selectedTemplate.slug, jsx_code: selectedTemplate.jsx_code }
    }));
    window.open(`/preview/${selectedTemplate.slug}?preview=true`, '_blank');
  };

  const handleSubmit = async () => {
    if (!user) return alert('Sesi habis. Silakan masuk kembali.');
    const err = getStepError();
    if (err) return alert(err);

    try {
      setLoading(true);
      if (profile?.role === 'customer') {
        const { data } = await supabase.from('invitations').select('id, status').eq('user_id', user.id);
        const activeCount = data?.filter(inv => inv.status === 'published' && inv.id !== editId).length || 0;
        if (activeCount >= 2) {
          alert('Maksimal 2 undangan aktif.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        user_id: user.id, template_id: selectedTemplate?.id, slug: customSlug.trim().toLowerCase(), groom_name: mempelai.groom_name, bride_name: mempelai.bride_name,
        groom_parent: mempelai.groom_parent, bride_parent: mempelai.bride_parent, quote: mempelai.quote, greeting: mempelai.greeting, love_story: mempelai.love_story || '', status: 'published'
      };

      let invitationId = editId;
      if (editId) {
        await invitationService.update(editId, payload);
        await supabase.from('events').delete().eq('invitation_id', editId);
        await supabase.from('gifts').delete().eq('invitation_id', editId);
        await supabase.from('media').delete().eq('invitation_id', editId);
      } else {
        const invitation = await invitationService.create(payload);
        invitationId = invitation.id;
      }

      const finalWaThumbnail = waThumbnail || base64ToFile(waThumbnailUrl, 'cover_photo.jpg');
      if (finalWaThumbnail) await storageService.uploadWhatsAppThumbnail(invitationId!, user.id, finalWaThumbnail);
      else if (editId && waThumbnailUrl) await invitationService.update(invitationId!, { thumbnail_url: waThumbnailUrl });

      const finalGroom = groomPhotoFile || base64ToFile(groomPhotoPreview, 'groom_photo.jpg');
      if (finalGroom) await storageService.uploadGalleryPhoto(invitationId!, user.id, finalGroom, 'groom_photo', -1);
      else if (groomPhotoPreview) await mediaService.create({ invitation_id: invitationId!, url: groomPhotoPreview, type: 'image', caption: 'groom_photo', sort_order: -1 });

      const finalBride = bridePhotoFile || base64ToFile(bridePhotoPreview, 'bride_photo.jpg');
      if (finalBride) await storageService.uploadGalleryPhoto(invitationId!, user.id, finalBride, 'bride_photo', -2);
      else if (bridePhotoPreview) await mediaService.create({ invitation_id: invitationId!, url: bridePhotoPreview, type: 'image', caption: 'bride_photo', sort_order: -2 });

      for (let i = 0; i < galleryItems.length; i++) {
        const item = galleryItems[i];
        const finalGallery = item.file || base64ToFile(item.preview, `gallery_${i}.jpg`);
        if (finalGallery) await storageService.uploadGalleryPhoto(invitationId!, user.id, finalGallery, item.caption, i);
        else await mediaService.create({ invitation_id: invitationId!, url: item.preview, type: 'image', caption: item.caption, sort_order: i });
      }

      await eventService.create({ invitation_id: invitationId!, type: 'akad', title: eventAkad.title, date: eventAkad.date, start_time: eventAkad.start_time, end_time: eventAkad.end_time, location_name: eventAkad.location_name, address: eventAkad.address, google_maps_url: eventAkad.google_maps_url });
      await eventService.create({ invitation_id: invitationId!, type: 'resepsi', title: eventResepsi.title, date: eventResepsi.date, start_time: eventResepsi.start_time, end_time: eventResepsi.end_time, location_name: eventResepsi.location_name, address: eventResepsi.address, google_maps_url: eventResepsi.google_maps_url });

      if (activePackage !== 'silver' || profile?.role === 'super_admin') {
        const validGifts = giftsList.filter(g => g.type === 'Kirim Kado' ? g.address?.trim() !== '' : g.account_number?.trim() !== '' && g.account_name?.trim() !== '');
        for (const giftData of validGifts) {
          await giftService.create({ invitation_id: invitationId!, type: giftData.type, bank_name: giftData.type === 'Bank' ? giftData.bank_name : '', account_number: giftData.type !== 'Kirim Kado' ? giftData.account_number : '', account_name: giftData.type !== 'Kirim Kado' ? giftData.account_name : '', ewallet_name: giftData.type === 'E-Wallet' ? giftData.ewallet_name : '', address: giftData.type === 'Kirim Kado' ? giftData.address : '' });
        }
      }

      localStorage.removeItem('nikahyuk_creation_draft');
      if (editId) localStorage.removeItem(`nikahyuk_edit_draft_${editId}`);
      alert(editId ? 'Undangan berhasil diperbarui!' : 'Undangan berhasil diterbitkan!');
      navigate('/dashboard/invitations', { state: { showDonation: !editId } });
    } catch (err: any) {
      console.error(err);
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerCropper = (file: File, type: 'groom' | 'bride' | 'cover') => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperType(type);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const stepsList = [
    { num: 1, label: 'Desain' }, { num: 2, label: 'Mempelai' }, { num: 3, label: 'Acara' },
    { num: 4, label: 'Media' }, { num: 5, label: 'Hadiah' }, { num: 6, label: 'Kirim' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button type="button" onClick={() => navigate('/dashboard/invitations')} className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{editId ? 'Sunting Undangan' : 'Buat Undangan Baru'}</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Asisten Pintar Aktif
        </div>
      </div>

      {hasRestoredDraft && !editId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm mb-6">
          <span className="text-emerald-800 text-xs font-bold">✍️ Melanjutkan rancangan draf pengisian terakhir Anda.</span>
          <button type="button" onClick={handleClearDraft} className="text-[11px] font-extrabold text-red-600 hover:text-red-750 bg-white border border-red-200 px-3 py-1.5 rounded-xl transition cursor-pointer">Mulai Ulang</button>
        </div>
      )}

      {/* Steps indicators */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-10" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 transition-all duration-300 -z-10" style={{ width: `${((activeStep - 1) / 5) * 100}%` }} />
          {stepsList.map(step => (
            <div key={step.num} className="flex flex-col items-center">
              <button type="button" onClick={() => { if (step.num < activeStep) setActiveStep(step.num); else if (step.num > activeStep && !getStepError()) setActiveStep(step.num); }} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition ${activeStep > step.num ? 'bg-primary-500 text-white' : activeStep === step.num ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-500 ring-offset-2' : 'bg-white text-gray-400 border border-gray-250'}`}>
                {activeStep > step.num ? <Check className="w-4 h-4" /> : step.num}
              </button>
              <span className={`text-xs mt-2 font-medium ${activeStep === step.num ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border p-8 shadow-sm min-h-[420px] flex flex-col justify-between mb-6">
        {activeStep === 1 && <ThemeSelectorStep templates={templates} fetchingTemplates={fetchingTemplates} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} selectedCategory={editor.selectedCategory || 'All'} setSelectedCategory={editor.setSelectedCategory} activePackage={activePackage} role={profile?.role} />}
        {activeStep === 2 && <BrideGroomStep mempelai={mempelai} setMempelai={setMempelai} selectedReligion={selectedReligion} setSelectedReligion={setSelectedReligion} groomPhotoPreview={groomPhotoPreview} bridePhotoPreview={bridePhotoPreview} triggerCropper={triggerCropper} />}
        {activeStep === 3 && <EventScheduleStep eventAkad={eventAkad} setEventAkad={setEventAkad} eventResepsi={eventResepsi} setEventResepsi={setEventResepsi} />}
        {activeStep === 4 && <GalleryUploadStep user={user} profile={profile} activePackage={activePackage} mempelai={mempelai} setMempelai={setMempelai} waThumbnailUrl={waThumbnailUrl} triggerCropper={triggerCropper} galleryItems={galleryItems} setGalleryItems={setGalleryItems} setLoading={setLoading} />}
        {activeStep === 5 && <GiftRegistryStep activePackage={activePackage} profile={profile} giftsList={giftsList} setGiftsList={setGiftsList} />}
        {activeStep === 6 && <SlugConfigStep customSlug={customSlug} setCustomSlug={setCustomSlug} checkingSlug={checkingSlug} slugExists={slugExists} selectedTemplate={selectedTemplate} mempelai={mempelai} eventAkad={eventAkad} eventResepsi={eventResepsi} handlePreviewNewTab={handlePreviewNewTab} />}

        <div className="border-t pt-6 mt-8 flex items-center justify-between">
          <button type="button" disabled={activeStep === 1 || loading} onClick={handlePrev} className={`flex items-center gap-1 text-sm font-bold px-5 py-2.5 rounded-xl border transition ${activeStep === 1 || loading ? 'opacity-40 bg-gray-50' : 'bg-white text-gray-700'}`}><ChevronLeft className="w-4 h-4" /> Sebelumnya</button>
          {activeStep < 6 ? (
            <button type="button" onClick={handleNext} className="flex items-center gap-1.5 text-sm font-bold bg-primary-600 text-white px-6 py-2.5 rounded-xl">Lanjutkan</button>
          ) : (
            <button type="button" disabled={loading || checkingSlug || slugExists === true} onClick={handleSubmit} className="flex items-center gap-1.5 text-sm font-extrabold bg-primary-600 text-white px-8 py-3 rounded-xl shadow-md disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editId ? 'Simpan Perubahan' : 'Terbitkan Undangan'}
            </button>
          )}
        </div>
      </div>

      <ImageCropperModal isOpen={showCropper} onClose={() => setShowCropper(false)} cropperType={cropperType} cropperImageSrc={cropperImageSrc} onCropComplete={(base64, file) => {
        if (cropperType === 'groom') { setGroomPhotoFile(file); setGroomPhotoPreview(base64); }
        else if (cropperType === 'bride') { setBridePhotoFile(file); setBridePhotoPreview(base64); }
        else if (cropperType === 'cover') { setWaThumbnail(file); setWaThumbnailUrl(base64); }
      }} />
    </div>
  );
}
