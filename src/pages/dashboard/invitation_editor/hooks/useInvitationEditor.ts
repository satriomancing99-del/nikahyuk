import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { Template } from '../../../../types/database.types';
import { templateService, invitationService, eventService, giftService, mediaService, transactionService } from '../../../../services';
import { FALLBACK_TEMPLATES } from '../utils/editorHelpers';

export const useInvitationEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  const editId = searchParams.get('id');

  const [activePackage, setActivePackage] = useState<'silver' | 'gold' | 'platinum'>('silver');
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Custom states
  const [selectedReligion, setSelectedReligion] = useState('Islam');
  const [customSlug, setCustomSlug] = useState('');
  const [slugExists, setSlugExists] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Form states
  const [mempelai, setMempelai] = useState({
    groom_name: '', groom_parent: '', bride_name: '', bride_parent: '',
    quote: 'Dan di antara tanda-tanda (kebesaran)-Nya...',
    greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh", love_story: '', music_url: ''
  });

  const [eventAkad, setEventAkad] = useState({
    title: 'Akad Nikah', date: '', start_time: '09:00', end_time: '11:00',
    location_name: '', address: '', google_maps_url: ''
  });

  const [eventResepsi, setEventResepsi] = useState({
    title: 'Resepsi Pernikahan', date: '', start_time: '11:30', end_time: '14:00',
    location_name: '', address: '', google_maps_url: ''
  });

  const [giftsList, setGiftsList] = useState<any[]>([
    { type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }
  ]);

  // Previews/Files
  const [waThumbnail, setWaThumbnail] = useState<File | null>(null);
  const [waThumbnailUrl, setWaThumbnailUrl] = useState<string>('');
  const [groomPhotoFile, setGroomPhotoFile] = useState<File | null>(null);
  const [bridePhotoFile, setBridePhotoFile] = useState<File | null>(null);
  const [groomPhotoPreview, setGroomPhotoPreview] = useState<string>('');
  const [bridePhotoPreview, setBridePhotoPreview] = useState<string>('');
  const [galleryItems, setGalleryItems] = useState<Array<{ file: File; preview: string; caption: string }>>([]);

  // Cropper states
  const [showCropper, setShowCropper] = useState(false);
  const [cropperType, setCropperType] = useState<'groom' | 'bride' | 'cover' | null>(null);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Auto-resolve package active tier
  useEffect(() => {
    if (!user) return;
    if (profile?.role === 'super_admin') {
      setActivePackage('platinum');
      return;
    }
    transactionService.getAll({ user_id: user.id, payment_status: 'success' })
      .then((data) => {
        if (data && data.length > 0) {
          const hasPlat = data.some(tx => tx.package_id === '550e8400-e29b-41d4-a716-446655440003');
          const hasGold = data.some(tx => tx.package_id === '550e8400-e29b-41d4-a716-446655440002');
          setActivePackage(hasPlat ? 'platinum' : hasGold ? 'gold' : 'silver');
        }
      });
  }, [user, profile]);

  // Auto-suggest Slug Recommendation (Only when creating, not editing)
  useEffect(() => {
    if (!editId && mempelai.groom_name && mempelai.bride_name) {
      const groomSlug = mempelai.groom_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brideSlug = mempelai.bride_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setCustomSlug(`${groomSlug}-${brideSlug}`.slice(0, 50));
    }
  }, [editId, mempelai.groom_name, mempelai.bride_name]);

  // Handle checking slug availability
  useEffect(() => {
    if (!customSlug) return;
    const delayDebounce = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const data = await invitationService.getAll({ slug: customSlug });
        if (data && data.length > 0) {
          setSlugExists(editId && data[0].id === editId ? false : true);
        } else {
          setSlugExists(false);
        }
      } catch (err) {
        setSlugExists(false);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [customSlug, editId]);

  return {
    navigate, editId, user, profile, activePackage, activeStep, setActiveStep, loading, setLoading,
    fetchingTemplates, setFetchingTemplates, templates, setTemplates, selectedTemplate, setSelectedTemplate,
    selectedReligion, setSelectedReligion, customSlug, setCustomSlug, slugExists, setSlugExists,
    checkingSlug, setCheckingSlug, hasRestoredDraft, setHasRestoredDraft, isDataLoaded, setIsDataLoaded,
    mempelai, setMempelai, eventAkad, setEventAkad, eventResepsi, setEventResepsi, giftsList, setGiftsList,
    waThumbnail, setWaThumbnail, waThumbnailUrl, setWaThumbnailUrl, groomPhotoFile, setGroomPhotoFile,
    bridePhotoFile, setBridePhotoFile, groomPhotoPreview, setGroomPhotoPreview, bridePhotoPreview, setBridePhotoPreview,
    galleryItems, setGalleryItems, showCropper, setShowCropper, cropperType, setCropperType,
    cropperImageSrc, setCropperImageSrc, selectedCategory, setSelectedCategory
  };
};
