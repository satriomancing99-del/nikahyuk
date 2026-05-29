import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Heart, Calendar, MapPin, Music, Upload, CheckCircle2, ChevronRight, 
  ChevronLeft, Plus, Trash2, ArrowRight, Check, AlertCircle, Info,
  ExternalLink, CreditCard, Gift, Loader2, Lock, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { templateService, invitationService, eventService, giftService, mediaService, storageService } from '../../services';
import { Template } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

// Initial fallback templates to seed if none exist
const FALLBACK_TEMPLATES = [
  // 1. Classic Category Tiers
  {
    name: 'Klasik Elegant Royal',
    slug: 'classic-silver',
    category: 'Classic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Royal Gold',
    slug: 'classic-gold',
    category: 'Classic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1507504038482-7621c37c2b62?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Obsidian Velvet',
    slug: 'classic-platinum',
    category: 'Classic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/classic',
    status: 'active'
  },

  // 2. Rustic Category Tiers
  {
    name: 'Rustic Warm Autumn',
    slug: 'rustic-silver',
    category: 'Rustic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Modern Botanical',
    slug: 'rustic',
    category: 'Rustic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Whispering Pines',
    slug: 'rustic-platinum',
    category: 'Rustic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/rustic',
    status: 'active'
  },

  // 3. Minimalist Category Tiers
  {
    name: 'Minimalist Clean Slate',
    slug: 'minimalist-silver',
    category: 'Minimalist',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Bento Grid',
    slug: 'minimalist-gold',
    category: 'Minimalist',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Premium Gold',
    slug: 'minimalist',
    category: 'Minimalist',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/minimalist',
    status: 'active'
  },

  // 4. Islamic Category Tiers
  {
    name: 'Islamic White Jasmine',
    slug: 'islamic-silver',
    category: 'Islamic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Sakura Rahmat',
    slug: 'islamic',
    category: 'Islamic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Emerald Arch',
    slug: 'islamic-platinum',
    category: 'Islamic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/islamic',
    status: 'active'
  },

  // 5. Floral Category Tiers
  {
    name: 'Floral Sweet Lavender',
    slug: 'floral-silver',
    category: 'Floral',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Garden Rose',
    slug: 'floral-gold',
    category: 'Floral',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Watercolor Blossom',
    slug: 'floral',
    category: 'Floral',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/floral',
    status: 'active'
  },

  // 6. Typography Category (No Photo - Pure Typographic)
  {
    name: 'Elegance Typique Minimalist',
    slug: 'elegance-typique',
    category: 'Typography',
    price: 0, // Available to all tiers (Silver, Gold, Platinum)
    thumbnail_url: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/elegance-typique',
    status: 'active'
  }
];

// Helper to convert base64 image string back to File object for upload
const base64ToFile = (base64Str: string, filename: string): File | null => {
  if (!base64Str || !base64Str.startsWith('data:image/')) return null;
  try {
    const arr = base64Str.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error('Error converting base64 to file:', e);
    return null;
  }
};

// Helper to convert local selected File to an optimized small base64 string for persistent draft storage
const fileToOptimizedBase64 = (file: File, maxDim = 500): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = (maxDim / w) * h;
            w = maxDim;
          } else {
            w = (maxDim / h) * w;
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve('');
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export default function CreateInvitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  
  const [activePackage, setActivePackage] = useState<'silver' | 'gold' | 'platinum'>(
    (searchParams.get('package') || 'silver').toLowerCase() as 'silver' | 'gold' | 'platinum'
  );

  // Dynamically resolve user's purchased package from database transactions
  useEffect(() => {
    async function checkPurchasedPackage() {
      if (!user) return;
      try {
        // Fetch successful transactions for the user
        const { data: txs, error } = await supabase
          .from('transactions')
          .select('package_id')
          .eq('user_id', user.id)
          .eq('payment_status', 'success');

        if (error) throw error;

        if (txs && txs.length > 0) {
          // Check if any transaction has Platinum or Gold package UUIDs
          const hasPlatinum = txs.some(tx => tx.package_id === '550e8400-e29b-41d4-a716-446655440003');
          const hasGold = txs.some(tx => tx.package_id === '550e8400-e29b-41d4-a716-446655440002');

          if (hasPlatinum) {
            setActivePackage('platinum');
          } else if (hasGold) {
            setActivePackage('gold');
          }
        }
      } catch (err) {
        console.error('Error resolving purchased package from database:', err);
      }
    }
    checkPurchasedPackage();
  }, [user]);

  const templateParam = searchParams.get('template') || '';
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [slugExists, setSlugExists] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  
  // Autosave Draft restored banner state
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleClearDraft = () => {
    if (editId) {
      if (window.confirm('Apakah Anda yakin ingin membatalkan semua perubahan draf suntingan ini dan memuat ulang data asli dari database?')) {
        localStorage.removeItem(`nikahyuk_edit_draft_${editId}`);
        window.location.reload();
      }
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus draf pengisian saat ini dan mulai ulang dari awal?')) {
      localStorage.removeItem('nikahyuk_creation_draft');
      setMempelai({
        groom_name: '',
        groom_parent: '',
        bride_name: '',
        bride_parent: '',
        quote: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
        love_story: '',
      });
      setEventAkad({
        title: 'Akad Nikah',
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        location_name: '',
        address: '',
        google_maps_url: '',
      });
      setEventResepsi({
        title: 'Resepsi Pernikahan',
        date: '',
        start_time: '11:30',
        end_time: '14:00',
        location_name: '',
        address: '',
        google_maps_url: '',
      });
      setGiftsList([
        { type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }
      ]);
      setCustomSlug('');
      setActiveStep(1);
      setHasRestoredDraft(false);
      
      // Clear previews & files too
      setWaThumbnail(null);
      setWaThumbnailUrl('');
      setMusicFile(null);
      setMusicFileName('');
      setGroomPhotoFile(null);
      setGroomPhotoPreview('');
      setBridePhotoFile(null);
      setBridePhotoPreview('');
      setGalleryItems([]);
    }
  };

  // Forms State
  // Step 1: Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Step 2: Bride and Groom Data
  const [mempelai, setMempelai] = useState({
    groom_name: '',
    groom_parent: '',
    bride_name: '',
    bride_parent: '',
    quote: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    love_story: '',
  });

  // Step 3: Event details (Akad & Resepsi)
  const [eventAkad, setEventAkad] = useState({
    title: 'Akad Nikah',
    date: '',
    start_time: '09:00',
    end_time: '11:00',
    location_name: '',
    address: '',
    google_maps_url: '',
  });

  const [eventResepsi, setEventResepsi] = useState({
    title: 'Resepsi Pernikahan',
    date: '',
    start_time: '11:30',
    end_time: '14:00',
    location_name: '',
    address: '',
    google_maps_url: '',
  });

  // Step 4: Media Upload state
  const [waThumbnail, setWaThumbnail] = useState<File | null>(null);
  const [waThumbnailUrl, setWaThumbnailUrl] = useState<string>('');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicFileName, setMusicFileName] = useState('');
  
  // Gallery files: array of { file: File, preview: string, caption: string }
  const [galleryItems, setGalleryItems] = useState<Array<{ file: File; preview: string; caption: string }>>([]);

  // Groom and Bride separate photos
  const [groomPhotoFile, setGroomPhotoFile] = useState<File | null>(null);
  const [bridePhotoFile, setBridePhotoFile] = useState<File | null>(null);
  const [groomPhotoPreview, setGroomPhotoPreview] = useState<string>('');
  const [bridePhotoPreview, setBridePhotoPreview] = useState<string>('');

  // Cropper Modal States
  const [showCropper, setShowCropper] = useState(false);
  const [cropperType, setCropperType] = useState<'groom' | 'bride' | 'cover' | null>(null);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');
  const [cropperImageFile, setCropperImageFile] = useState<File | null>(null);
  
  // Interactive adjustment states
  const [cropperZoom, setCropperZoom] = useState(1);
  const [cropperOffset, setCropperOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropperImgNaturalDim, setCropperImgNaturalDim] = useState({ w: 0, h: 0 });

  const maskW = 300;
  const maskH = cropperType === 'cover' ? 375 : 300;
  const targetW = cropperType === 'cover' ? 800 : 500;
  const targetH = cropperType === 'cover' ? 1000 : 500;

  const { baselineW, baselineH } = useMemo(() => {
    if (!cropperImgNaturalDim.w || !cropperImgNaturalDim.h) {
      return { baselineW: maskW, baselineH: maskH };
    }
    const imgRatio = cropperImgNaturalDim.w / cropperImgNaturalDim.h;
    const maskRatio = maskW / maskH;
    
    if (imgRatio > maskRatio) {
      return {
        baselineW: maskH * imgRatio,
        baselineH: maskH
      };
    } else {
      return {
        baselineW: maskW,
        baselineH: maskW / imgRatio
      };
    }
  }, [cropperImgNaturalDim, cropperType]);

  const handleCropperMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropperOffset.x,
      y: e.clientY - cropperOffset.y
    });
  };

  const handleCropperMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropperOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCropperMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropperTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - cropperOffset.x,
        y: e.touches[0].clientY - cropperOffset.y
      });
    }
  };

  const handleCropperTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      setCropperOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const triggerCropper = (file: File, type: 'groom' | 'bride' | 'cover') => {
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('File yang dipilih bukan gambar yang valid. Silakan pilih berkas gambar (PNG, JPG, JPEG, atau WEBP).');
      return;
    }

    // Limit image size to 5MB to perfectly match Supabase storage and backend constraints
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Ukuran file gambar terlalu besar. Maksimal ukuran gambar adalah 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      alert('Gagal membaca file dari penyimpanan lokal Anda.');
    };
    
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperImageFile(file);
      setCropperType(type);
      setCropperZoom(1);
      setCropperOffset({ x: 0, y: 0 });
      setIsDragging(false);
      
      const tempImg = new Image();
      tempImg.onerror = () => {
        alert('Berkas gambar rusak atau tidak dapat didekode sebagai gambar.');
      };
      
      tempImg.onload = () => {
        setCropperImgNaturalDim({ w: tempImg.width, h: tempImg.height });
        setShowCropper(true);
      };
      
      tempImg.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGroomPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      triggerCropper(e.target.files[0], 'groom');
    }
  };

  const handleBridePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      triggerCropper(e.target.files[0], 'bride');
    }
  };

  // Step 5: Wedding Gift (multiple gifts support)
  const [giftsList, setGiftsList] = useState<Array<{
    type: 'Bank' | 'E-Wallet' | 'Kirim Kado';
    bank_name: string;
    account_number: string;
    account_name: string;
    ewallet_name: string;
    address: string;
  }>>([
    { type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }
  ]);

  // Step 6: Slug customization
  const [customSlug, setCustomSlug] = useState('');

  // Category filter for Step 1 template selection
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredTemplates = templates.filter(t => {
    // Category filter
    const isTypography = t.category?.toLowerCase() === 'typography' || t.slug?.includes('typique');
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Typography') {
        if (!isTypography) return false;
      } else {
        if (t.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
    }

    // Typography templates are always unlocked for all tiers
    if (isTypography) return true;

    if (profile?.role === 'super_admin') return true;
    const price = Number(t.price);
    if (activePackage === 'silver') return price === 0 || price === 49000;
    if (activePackage === 'gold') return price <= 99000;
    return true; // platinum can access all
  });

  // Check if we are in EDIT mode
  const editId = searchParams.get('id');

  // Load existing data if editing or restore draft if creating
  useEffect(() => {
    if (!user) return; // Wait until authenticated session is fully loaded
    
    if (!editId) {
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
              file: null as any,
              preview,
              caption: draft.galleryItemsCaptions?.[idx] || 'Foto Galeri'
            })));
          }
          setHasRestoredDraft(true);
        } catch (e) {
          console.error('Error loading autosaved draft:', e);
        }
      }
      setIsDataLoaded(true); // Create mode is fully initialized
      return;
    }
    
    async function loadEditData() {
      try {
        setLoading(true);
        
        // 1st Priority: Check if there is an autosaved edit draft in localStorage for this invitation!
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
                file: null as any,
                preview,
                caption: draft.galleryItemsCaptions?.[idx] || 'Foto Galeri'
              })));
            }
            setHasRestoredDraft(true);
            setLoading(false);
            setIsDataLoaded(true); // Edit draft is fully loaded
            return; // Skip database fetch as we successfully restored their latest unsaved edits!
          } catch (e) {
            console.error('Error loading edit draft:', e);
          }
        }

        const { data: inv, error: invErr } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', editId)
          .single();

        if (invErr || !inv) throw new Error('Undangan tidak ditemukan atau akses ditolak.');

        setMempelai({
          groom_name: inv.groom_name || '',
          groom_parent: inv.groom_parent || '',
          bride_name: inv.bride_name || '',
          bride_parent: inv.bride_parent || '',
          quote: inv.quote || '',
          love_story: inv.love_story || '',
        });
        
        setCustomSlug(inv.slug || '');
        if (inv.thumbnail_url) {
          setWaThumbnailUrl(inv.thumbnail_url);
        }

        // Fetch BGM filename mockup if exists
        if (inv.music_url) {
          setMusicFileName(inv.music_url.split('/').pop() || 'Lagu Terpilih');
        }

        // Fetch Events
        const { data: evts, error: evtsErr } = await supabase
          .from('events')
          .select('*')
          .eq('invitation_id', editId);
        
        if (evts && !evtsErr) {
          const akad = evts.find(e => e.type === 'akad');
          if (akad) {
            setEventAkad({
              title: akad.title || 'Akad Nikah',
              date: akad.date || '',
              start_time: akad.start_time?.slice(0, 5) || '09:00',
              end_time: akad.end_time?.slice(0, 5) || '11:00',
              location_name: akad.location_name || '',
              address: akad.address || '',
              google_maps_url: akad.google_maps_url || '',
            });
          }
          const resepsi = evts.find(e => e.type === 'resepsi');
          if (resepsi) {
            setEventResepsi({
              title: resepsi.title || 'Resepsi Pernikahan',
              date: resepsi.date || '',
              start_time: resepsi.start_time?.slice(0, 5) || '11:30',
              end_time: resepsi.end_time?.slice(0, 5) || '14:00',
              location_name: resepsi.location_name || '',
              address: resepsi.address || '',
              google_maps_url: resepsi.google_maps_url || '',
            });
          }
        }

        // Fetch Gifts
        const { data: gfts, error: gftsErr } = await supabase
          .from('gifts')
          .select('*')
          .eq('invitation_id', editId);
        
        if (gfts && !gftsErr && gfts.length > 0) {
          setGiftsList(gfts.map(g => ({
            type: g.type || 'Bank',
            bank_name: g.bank_name || 'BCA',
            account_number: g.account_number || '',
            account_name: g.account_name || '',
            ewallet_name: g.ewallet_name || 'GoPay',
            address: g.address || '',
          })));
        }

        // Fetch Media (Gallery & Profile Photos)
        const { data: media, error: mediaErr } = await supabase
          .from('media')
          .select('*')
          .eq('invitation_id', editId);
        
        if (media && !mediaErr) {
          const groomImg = media.find(m => m.caption === 'groom_photo');
          if (groomImg) setGroomPhotoPreview(groomImg.url);

          const brideImg = media.find(m => m.caption === 'bride_photo');
          if (brideImg) setBridePhotoPreview(brideImg.url);

          const prewedImgs = media.filter(m => m.caption !== 'groom_photo' && m.caption !== 'bride_photo');
          setGalleryItems(prewedImgs.map(m => ({
            file: null as any,
            preview: m.url,
            caption: m.caption || 'Foto Galeri'
          })));
        }
        
        setIsDataLoaded(true); // Edit DB values fully loaded
      } catch (err: any) {
        console.error('Error loading edit data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEditData();
  }, [editId, user]);

  // Fetch templates & seed database if empty
  useEffect(() => {
    if (!user) return; // Wait until authenticated session is fully loaded
    
    async function loadTemplates() {
      try {
        setFetchingTemplates(true);
        let list = await templateService.getAll();
        
        // If empty, let's seed fallback templates automatically to avoid blank step 1
        if (list.length === 0) {
          console.log('Templates table is empty. Seeding defaults...');
          const seeded: Template[] = [];
          for (const item of FALLBACK_TEMPLATES) {
            try {
              const res = await templateService.create(item);
              seeded.push(res);
            } catch (err) {
              console.error('Error seeding template:', err);
            }
          }
          list = seeded.length > 0 ? seeded : (FALLBACK_TEMPLATES as unknown as Template[]);
        }
        
        // Filter active templates
        const activeTemplates = list.filter(t => t.status === 'active');
        setTemplates(activeTemplates);
        
        // Filter by package for initial selection
        const allowed = activeTemplates.filter(t => {
          if (profile?.role === 'super_admin') return true;
          const price = Number(t.price);
          if (activePackage === 'silver') return price === 0 || price === 49000;
          if (activePackage === 'gold') return price <= 99000;
          return true;
        });

        // Check if there is an autosaved template in localStorage first
        const savedDraft = localStorage.getItem('nikahyuk_creation_draft');
        const savedEditDraft = localStorage.getItem(`nikahyuk_edit_draft_${editId}`);
        let restoredTemplate = null;
        if (editId) {
          try {
            let selectedTplId = null;
            if (savedEditDraft) {
              try {
                const draft = JSON.parse(savedEditDraft);
                selectedTplId = draft.selectedTemplateId;
              } catch (e) {
                console.error('Error parsing edit draft for template preselection:', e);
              }
            }

            if (selectedTplId) {
              const found = activeTemplates.find(t => t.id === selectedTplId);
              if (found) restoredTemplate = found;
            } else {
              const { data: inv } = await supabase
                .from('invitations')
                .select('template_id')
                .eq('id', editId)
                .single();
              if (inv && inv.template_id) {
                const found = activeTemplates.find(t => t.id === inv.template_id);
                if (found) restoredTemplate = found;
              }
            }
          } catch (err) {
            console.error('Error loading invitation template in edit mode:', err);
          }
        } else if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (draft.selectedTemplateId) {
              const found = activeTemplates.find(t => t.id === draft.selectedTemplateId);
              if (found) restoredTemplate = found;
            }
          } catch (e) {
            console.error('Error parsing draft template:', e);
          }
        }

        // Set preselection from query if editId is not loaded yet
        if (restoredTemplate) {
          setSelectedTemplate(restoredTemplate);
        } else if (!editId && templateParam) {
          const preSelected = activeTemplates.find(t => t.slug === templateParam);
          if (preSelected) {
            const isAllowed = profile?.role === 'super_admin' || activePackage === 'platinum' || 
              (activePackage === 'gold' && Number(preSelected.price) <= 99000) ||
              (activePackage === 'silver' && (Number(preSelected.price) === 0 || Number(preSelected.price) === 49000));
            
            if (isAllowed) {
              setSelectedTemplate(preSelected);
            } else {
              alert(`Template "${preSelected.name}" memerlukan paket yang lebih tinggi dari ${activePackage.toUpperCase()}. Kami telah memilihkan template default yang sesuai.`);
              if (allowed.length > 0) setSelectedTemplate(allowed[0]);
            }
          } else {
            if (allowed.length > 0) setSelectedTemplate(allowed[0]);
          }
        } else if (!editId) {
          if (allowed.length > 0) setSelectedTemplate(allowed[0]);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
        // Fallback offline templates
        const fallbackActive = FALLBACK_TEMPLATES as unknown as Template[];
        setTemplates(fallbackActive);
        
        const allowedFallback = fallbackActive.filter(t => {
          const price = Number(t.price);
          if (activePackage === 'silver') return price === 0 || price === 49000;
          if (activePackage === 'gold') return price <= 99000;
          return true;
        });
        
        if (!editId) {
          if (allowedFallback.length > 0) {
            setSelectedTemplate(allowedFallback[0]);
          } else {
            setSelectedTemplate(fallbackActive[0]);
          }
        }
      } finally {
        setFetchingTemplates(false);
      }
    }
    loadTemplates();
  }, [editId, user]);

  // Autosave Draft Progress to LocalStorage dynamically (Only when creating a NEW invitation, not when editing)
  useEffect(() => {
    if (editId) return; // Do not autosave draft when editing an existing database record
    if (fetchingTemplates) return; // Wait until initial template loading & restoration completes!
    if (!isDataLoaded) return; // Wait until initial data loading/restoration completes!
    
    const draftData = {
      activeStep,
      selectedTemplateId: selectedTemplate?.id || null,
      mempelai,
      eventAkad,
      eventResepsi,
      giftsList,
      customSlug,
      waThumbnailUrl,
      groomPhotoPreview,
      bridePhotoPreview,
      galleryItemsPreviews: galleryItems.map(item => item.preview),
      galleryItemsCaptions: galleryItems.map(item => item.caption),
    };
    
    try {
      localStorage.setItem('nikahyuk_creation_draft', JSON.stringify(draftData));
    } catch (e) {
      console.warn('LocalStorage creation draft write failed:', e);
    }
  }, [activeStep, selectedTemplate, mempelai, eventAkad, eventResepsi, giftsList, customSlug, editId, fetchingTemplates, isDataLoaded, waThumbnailUrl, groomPhotoPreview, bridePhotoPreview, galleryItems]);

  // Autosave Draft Progress to LocalStorage dynamically (For Edit Mode)
  useEffect(() => {
    if (!editId) return; // Only run in Edit Mode
    if (loading) return; // Don't save while initial data is fetching/loading!
    if (!isDataLoaded) return; // Wait until initial data loading completes!
    
    const draftData = {
      activeStep,
      selectedTemplateId: selectedTemplate?.id || null,
      mempelai,
      eventAkad,
      eventResepsi,
      giftsList,
      customSlug,
      waThumbnailUrl,
      groomPhotoPreview,
      bridePhotoPreview,
      galleryItemsPreviews: galleryItems.map(item => item.preview),
      galleryItemsCaptions: galleryItems.map(item => item.caption),
    };
    
    try {
      localStorage.setItem(`nikahyuk_edit_draft_${editId}`, JSON.stringify(draftData));
    } catch (e) {
      console.warn('LocalStorage edit draft write failed:', e);
    }
  }, [activeStep, selectedTemplate, mempelai, eventAkad, eventResepsi, giftsList, customSlug, editId, loading, isDataLoaded, waThumbnailUrl, groomPhotoPreview, bridePhotoPreview, galleryItems]);

  // Update slug recommendation automatically based on bride & groom names (only when NOT editing)
  useEffect(() => {
    if (!editId && mempelai.groom_name && mempelai.bride_name) {
      const groomSlug = mempelai.groom_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brideSlug = mempelai.bride_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const recommended = `${groomSlug}-${brideSlug}`.slice(0, 50);
      setCustomSlug(recommended);
    }
  }, [editId, mempelai.groom_name, mempelai.bride_name]);

  // Handle checking slug availability
  useEffect(() => {
    if (!customSlug) return;
    const delayDebounce = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('id, slug')
          .eq('slug', customSlug);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // If the matching slug belongs to the current editing invitation, it is available!
          if (editId && data[0].id === editId) {
            setSlugExists(false);
          } else {
            setSlugExists(true);
          }
        } else {
          setSlugExists(false);
        }
      } catch (err) {
        console.error('Error checking slug:', err);
        setSlugExists(false);
      } finally {
        setCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [customSlug, editId]);

  // Validation routines per step
  const getStepError = (): string | null => {
    if (activeStep === 1 && !selectedTemplate) {
      return 'Silakan pilih desain template undangan terlebih dahulu.';
    }
    if (activeStep === 2) {
      if (!mempelai.groom_name.trim()) return 'Nama lengkap mempelai pria wajib diisi.';
      if (!mempelai.groom_parent.trim()) return 'Nama orang tua mempelai pria wajib diisi.';
      if (!mempelai.bride_name.trim()) return 'Nama lengkap mempelai wanita wajib diisi.';
      if (!mempelai.bride_parent.trim()) return 'Nama orang tua mempelai wanita wajib diisi.';
      if (!mempelai.quote.trim()) return 'Kutipan / ucapan pembuka wajib diisi.';
    }
    if (activeStep === 3) {
      if (!eventAkad.date) return 'Tanggal pelaksanaan Akad Nikah wajib diisi.';
      if (!eventAkad.location_name.trim()) return 'Tempat / Gedung Akad Nikah wajib diisi.';
      if (!eventAkad.address.trim()) return 'Alamat lokasi Akad Nikah wajib diisi.';
      
      if (!eventResepsi.date) return 'Tanggal pelaksanaan Resepsi wajib diisi.';
      if (!eventResepsi.location_name.trim()) return 'Tempat / Gedung Resepsi wajib diisi.';
      if (!eventResepsi.address.trim()) return 'Alamat lokasi Resepsi wajib diisi.';
    }
    if (activeStep === 5) {
      if (activePackage === 'silver') {
        // Silver package skips gift validation entirely as E-Gift is locked/empty
        return null;
      }
      for (let i = 0; i < giftsList.length; i++) {
        const g = giftsList[i];
        if (g.type === 'Bank') {
          if (!g.bank_name) return `Nama Bank di baris ${i + 1} wajib dipilih/diisi.`;
          if (!g.account_number.trim()) return `Nomor Rekening Bank di baris ${i + 1} wajib diisi.`;
          if (!g.account_name.trim()) return `Nama Pemilik Rekening Bank di baris ${i + 1} wajib diisi.`;
        } else if (g.type === 'E-Wallet') {
          if (!g.ewallet_name) return `Nama E-Wallet di baris ${i + 1} wajib dipilih/diisi.`;
          if (!g.account_number.trim()) return `Nomor HP E-Wallet di baris ${i + 1} wajib diisi.`;
          if (!g.account_name.trim()) return `Nama Pemisah di baris ${i + 1} wajib diisi.`;
        } else if (g.type === 'Kirim Kado') {
          if (activePackage === 'gold') {
            return `Metode kado fisik di baris ${i + 1} hanya tersedia untuk paket Platinum.`;
          }
          if (!g.address.trim()) return `Alamat pengiriman Kado di baris ${i + 1} wajib diisi.`;
        }
      }
    }
    if (activeStep === 6) {
      if (!customSlug.trim()) return 'Link URL undangan (slug) wajib diisi.';
      if (slugExists) return 'Link URL undangan sudah digunakan oleh pasangan lain. Silakan ubah.';
    }
    return null;
  };

  const handleNext = () => {
    const err = getStepError();
    if (err) {
      alert(err);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  // Thumbnail upload preview helper
  const handleWaThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerCropper(file, 'cover');
    }
  };

  // BG Music helper
  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate that it is an audio file or has mp3 extension
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
        alert('File yang dipilih bukan berkas audio yang valid. Silakan pilih file musik MP3.');
        return;
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Ukuran file musik terlalu besar. Maksimal ukuran berkas audio adalah 10 MB.');
        return;
      }
      
      setMusicFile(file);
      setMusicFileName(file.name);
    }
  };

  // Add more item to gallery
  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      const invalidNames: string[] = [];
      const oversizedNames: string[] = [];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          invalidNames.push(file.name);
        } else if (file.size > maxSize) {
          oversizedNames.push(file.name);
        } else {
          validFiles.push(file);
        }
      }
      
      if (invalidNames.length > 0) {
        alert(`Beberapa file ditolak karena bukan gambar yang valid:\n- ${invalidNames.join('\n- ')}`);
      }
      
      if (oversizedNames.length > 0) {
        alert(`Beberapa gambar ditolak karena ukurannya melebihi 5 MB:\n- ${oversizedNames.join('\n- ')}`);
      }
      
      if (validFiles.length === 0) return;
      
      const maxPhotos = activePackage === 'silver' ? 3 : activePackage === 'gold' ? 8 : 12;
      if (galleryItems.length + validFiles.length > maxPhotos) {
        alert(`Batas maksimal foto untuk Paket ${activePackage.toUpperCase()} adalah ${maxPhotos} foto. Silakan hapus beberapa foto atau upgrade paket Anda.`);
        return;
      }
      
      try {
        setLoading(true);
        const items = [];
        for (const file of validFiles) {
          const optimizedBase64 = await fileToOptimizedBase64(file);
          items.push({
            file,
            preview: optimizedBase64 || URL.createObjectURL(file),
            caption: ''
          });
        }
        setGalleryItems(prev => [...prev, ...items]);
      } catch (err) {
        console.error('Error optimizing gallery image:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Remove photo from gallery
  const handleRemoveGalleryImage = (index: number) => {
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update image caption in gallery state
  const handleCaptionChange = (index: number, caption: string) => {
    setGalleryItems(prev => prev.map((item, i) => i === index ? { ...item, caption } : item));
  };

  // Add / Remove gift rows
  const handleAddGift = () => {
    setGiftsList(prev => [...prev, { type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }]);
  };

  const handleRemoveGift = (index: number) => {
    setGiftsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleGiftFieldChange = (index: number, field: string, value: string) => {
    setGiftsList(prev => prev.map((gift, i) => i === index ? { ...gift, [field]: value } : gift));
  };

  // Save current progress to localStorage and open the template preview in a new tab
  const handlePreviewNewTab = async () => {
    if (!selectedTemplate) {
      alert("Silakan pilih desain template terlebih dahulu di Langkah 1.");
      return;
    }

    try {
      setLoading(true);

      const fileToBase64Minified = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(reader.result as string);
                return;
              }
              const maxDim = 600;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = (maxDim / w) * h;
                  w = maxDim;
                } else {
                  w = (maxDim / h) * w;
                  h = maxDim;
                }
              }
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => resolve('');
            img.src = reader.result as string;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      };

      const urlToBase64 = async (url: string, file: File | null): Promise<string> => {
        if (file) {
          return await fileToBase64Minified(file);
        }
        if (!url) return '';
        if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  resolve(reader.result as string);
                  return;
                }
                const maxDim = 600;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                  if (w > h) {
                    h = (maxDim / w) * h;
                    w = maxDim;
                  } else {
                    w = (maxDim / h) * w;
                    h = maxDim;
                  }
                }
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
              };
              img.onerror = () => resolve(reader.result as string);
              img.src = reader.result as string;
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error('Error converting url to base64:', e);
          return url;
        }
      };

      // Convert images to base64 for reliable multi-tab rendering (since Blob URLs are document-scoped)
      const resolvedCoverUrl = await urlToBase64(waThumbnailUrl, waThumbnail);
      const resolvedGroomUrl = await urlToBase64(groomPhotoPreview, groomPhotoFile);
      const resolvedBrideUrl = await urlToBase64(bridePhotoPreview, bridePhotoFile);

      const resolvedGallery = [];
      for (const item of galleryItems) {
        const url = await urlToBase64(item.preview, item.file);
        resolvedGallery.push({
          preview: url,
          caption: item.caption || 'Foto Galeri'
        });
      }

      const draftData = {
        invitation: {
          groom_name: mempelai.groom_name || 'Mempelai Pria',
          groom_parent: mempelai.groom_parent || 'Ayah & Ibu',
          bride_name: mempelai.bride_name || 'Mempelai Wanita',
          bride_parent: mempelai.bride_parent || 'Ayah & Ibu',
          quote: mempelai.quote,
          thumbnail_url: resolvedCoverUrl || selectedTemplate.thumbnail_url,
          love_story: mempelai.love_story || '',
          music_url: musicFile ? URL.createObjectURL(musicFile) : '',
          status: 'draft',
        },
        events: [
          {
            id: 'evt-1',
            type: 'akad',
            title: eventAkad.title || 'Akad Nikah',
            date: eventAkad.date || new Date().toISOString().split('T')[0],
            start_time: eventAkad.start_time || '09:00',
            end_time: eventAkad.end_time || '11:00',
            location_name: eventAkad.location_name || 'Gedung Akad',
            address: eventAkad.address || 'Alamat Akad',
            google_maps_url: eventAkad.google_maps_url,
          },
          {
            id: 'evt-2',
            type: 'resepsi',
            title: eventResepsi.title || 'Resepsi Pernikahan',
            date: eventResepsi.date || new Date().toISOString().split('T')[0],
            start_time: eventResepsi.start_time || '11:30',
            end_time: eventResepsi.end_time || '14:00',
            location_name: eventResepsi.location_name || 'Gedung Resepsi',
            address: eventResepsi.address || 'Alamat Resepsi',
            google_maps_url: eventResepsi.google_maps_url,
          }
        ],
        gifts: activePackage !== 'silver' ? giftsList
          .filter(g => {
            if (g.type === 'Bank' || g.type === 'E-Wallet') {
              return g.account_number?.trim() !== '' && g.account_name?.trim() !== '';
            } else if (g.type === 'Kirim Kado') {
              return g.address?.trim() !== '';
            }
            return false;
          })
          .map((g, idx) => ({
            id: `g-${idx}`,
            type: g.type,
            bank_name: g.bank_name,
            account_number: g.account_number,
            account_name: g.account_name,
            ewallet_name: g.ewallet_name,
            address: g.address
          })) : [],
        gallery: [
          // Inject groom & bride profile photos first so they can be parsed out cleanly
          ...(resolvedGroomUrl ? [{ id: 'gp-1', url: resolvedGroomUrl, caption: 'groom_photo' }] : []),
          ...(resolvedBrideUrl ? [{ id: 'bp-1', url: resolvedBrideUrl, caption: 'bride_photo' }] : []),
          // Map prewedding gallery
          ...resolvedGallery.map((item, idx) => ({
            id: `gal-${idx}`,
            url: item.preview,
            caption: item.caption || 'Foto Galeri'
          }))
        ],
        template: {
          slug: selectedTemplate.slug,
          jsx_code: selectedTemplate.jsx_code
        }
      };

      try {
        localStorage.setItem('draft_invitation_preview', JSON.stringify(draftData));
      } catch (e) {
        console.warn('LocalStorage preview draft write failed:', e);
        // Fallback: still attempt to open preview, but alert user that images may not render fully if quota exceeded
        alert('Perhatian: Memori penyimpanan penuh. Gambar pratinjau resolusi tinggi Anda mungkin tidak tampil sepenuhnya di tab baru. Disarankan untuk meminimalkan ukuran file foto Anda.');
      }
      window.open(`/preview/${selectedTemplate.slug}?preview=true`, '_blank');
    } catch (e) {
      console.error('Error generating base64 draft preview:', e);
      alert('Gagal mempersiapkan pratinjau gambar kustom.');
    } finally {
      setLoading(false);
    }
  };

  // Submitting form to Supabase - Core transactional script
  const handleSubmit = async () => {
    if (!user) {
      alert('Sesi masuk Anda telah kedaluwarsa. Silakan masuk kembali.');
      return;
    }

    const err = getStepError();
    if (err) {
      alert(err);
      return;
    }

    try {
      setLoading(true);

      // Enforce maximum of 2 active/published invitations limit for customer role
      if (profile?.role === 'customer') {
        const { data: existingInvs, error: checkError } = await supabase
          .from('invitations')
          .select('id, status')
          .eq('user_id', user.id);
        
        if (checkError) throw checkError;

        // Count existing active/published invitations excluding the one we are editing
        const activeCount = existingInvs?.filter(inv => 
          inv.status === 'published' && inv.id !== editId
        ).length || 0;

        if (activeCount >= 2) {
          alert('Batas Undangan Aktif Terlampaui!\n\nSebagai pelanggan, Anda hanya diperbolehkan memiliki maksimal 2 undangan aktif/diterbitkan secara bersamaan.\n\nSilakan hapus atau ubah status undangan aktif Anda yang lain terlebih dahulu di halaman daftar undangan.');
          setLoading(false);
          return;
        }
      }
      
      // Step 1: Create or Update Invitation row
      const invitationPayload = {
        user_id: user.id,
        template_id: selectedTemplate?.id,
        slug: customSlug.trim().toLowerCase(),
        groom_name: mempelai.groom_name,
        bride_name: mempelai.bride_name,
        groom_parent: mempelai.groom_parent,
        bride_parent: mempelai.bride_parent,
        quote: mempelai.quote,
        love_story: mempelai.love_story || '',
        status: 'published', // Active published
      };

      let invitationId = editId;
      if (editId) {
        await invitationService.update(editId, invitationPayload);
      } else {
        const invitation = await invitationService.create(invitationPayload);
        invitationId = invitation.id;
      }

      if (!invitationId) throw new Error("Gagal memperoleh ID Undangan.");

      // Clean old events, gifts, and media rows if editing to enable fresh overwrite seeding
      if (editId) {
        await supabase.from('events').delete().eq('invitation_id', editId);
        await supabase.from('gifts').delete().eq('invitation_id', editId);
        await supabase.from('media').delete().eq('invitation_id', editId);
      }

      // Step 2: Upload Files (BGM, Social Media Whatsapp Cards, Gallery)
      // Upload Social Media Whatsapp card if specified
      const finalWaThumbnail = waThumbnail || base64ToFile(waThumbnailUrl, 'cover_photo.jpg');
      if (finalWaThumbnail) {
        try {
          await storageService.uploadWhatsAppThumbnail(invitationId, user.id, finalWaThumbnail);
        } catch (uploadErr: any) {
          console.error('Error uploading WA share thumbnail:', uploadErr);
          throw new Error(`Gagal mengunggah foto sampul utama: ${uploadErr.message || 'Kesalahan penyimpanan'}`);
        }
      } else if (editId && waThumbnailUrl) {
        // Keep existing thumbnail
        await invitationService.update(invitationId, { thumbnail_url: waThumbnailUrl });
      }

      // Upload BGM Audio Track
      if (musicFile) {
        try {
          await storageService.uploadMusic(invitationId, user.id, musicFile);
        } catch (uploadErr: any) {
          console.error('Error uploading custom BGM:', uploadErr);
          throw new Error(`Gagal mengunggah musik pengiring: ${uploadErr.message || 'Kesalahan penyimpanan'}`);
        }
      }

      // Upload Groom Photo
      const finalGroomPhoto = groomPhotoFile || base64ToFile(groomPhotoPreview, 'groom_photo.jpg');
      if (finalGroomPhoto) {
        try {
          await storageService.uploadGalleryPhoto(invitationId, user.id, finalGroomPhoto, 'groom_photo', -1);
        } catch (uploadErr: any) {
          console.error('Error uploading groom photo:', uploadErr);
          throw new Error(`Gagal mengunggah foto mempelai pria: ${uploadErr.message || 'Kesalahan penyimpanan'}`);
        }
      } else if (groomPhotoPreview) {
        // Re-create existing media row
        try {
          await mediaService.create({
            invitation_id: invitationId,
            url: groomPhotoPreview,
            type: 'image',
            caption: 'groom_photo',
            sort_order: -1
          });
        } catch (mErr: any) {
          console.error('Error preserving groom photo row:', mErr);
          throw new Error(`Gagal memproses ulang foto mempelai pria: ${mErr.message || 'Kesalahan database'}`);
        }
      }

      // Upload Bride Photo
      const finalBridePhoto = bridePhotoFile || base64ToFile(bridePhotoPreview, 'bride_photo.jpg');
      if (finalBridePhoto) {
        try {
          await storageService.uploadGalleryPhoto(invitationId, user.id, finalBridePhoto, 'bride_photo', -2);
        } catch (uploadErr: any) {
          console.error('Error uploading bride photo:', uploadErr);
          throw new Error(`Gagal mengunggah foto mempelai wanita: ${uploadErr.message || 'Kesalahan penyimpanan'}`);
        }
      } else if (bridePhotoPreview) {
        // Re-create existing media row
        try {
          await mediaService.create({
            invitation_id: invitationId,
            url: bridePhotoPreview,
            type: 'image',
            caption: 'bride_photo',
            sort_order: -2
          });
        } catch (mErr: any) {
          console.error('Error preserving bride photo row:', mErr);
          throw new Error(`Gagal memproses ulang foto mempelai wanita: ${mErr.message || 'Kesalahan database'}`);
        }
      }

      // Upload Gallery Images sequentially
      for (let i = 0; i < galleryItems.length; i++) {
        const item = galleryItems[i];
        const finalGalleryFile = item.file || base64ToFile(item.preview, `gallery_${i}.jpg`);
        try {
          if (finalGalleryFile) {
            await storageService.uploadGalleryPhoto(invitationId, user.id, finalGalleryFile, item.caption, i);
          } else {
            // Re-create existing media row
            await mediaService.create({
              invitation_id: invitationId,
              url: item.preview,
              type: 'image',
              caption: item.caption || 'Foto Galeri',
              sort_order: i
            });
          }
        } catch (uploadErr: any) {
          console.error(`Error uploading/preserving gallery item ${i}:`, uploadErr);
          throw new Error(`Gagal memproses foto galeri ke-${i + 1}: ${uploadErr.message || 'Kesalahan penyimpanan'}`);
        }
      }

      // Step 3: Insert Events (Akad & Resepsi)
      await eventService.create({
        invitation_id: invitationId,
        type: 'akad',
        title: eventAkad.title,
        date: eventAkad.date,
        start_time: eventAkad.start_time,
        end_time: eventAkad.end_time,
        location_name: eventAkad.location_name,
        address: eventAkad.address,
        google_maps_url: eventAkad.google_maps_url,
      });

      await eventService.create({
        invitation_id: invitationId,
        type: 'resepsi',
        title: eventResepsi.title,
        date: eventResepsi.date,
        start_time: eventResepsi.start_time,
        end_time: eventResepsi.end_time,
        location_name: eventResepsi.location_name,
        address: eventResepsi.address,
        google_maps_url: eventResepsi.google_maps_url,
      });

      // Step 4: Insert Gifts
      if (activePackage !== 'silver') {
        const validGifts = giftsList.filter(g => {
          if (g.type === 'Bank' || g.type === 'E-Wallet') {
            return g.account_number?.trim() !== '' && g.account_name?.trim() !== '';
          } else if (g.type === 'Kirim Kado') {
            return g.address?.trim() !== '';
          }
          return false;
        });

        for (const giftData of validGifts) {
          await giftService.create({
            invitation_id: invitationId,
            type: giftData.type,
            bank_name: giftData.type === 'Bank' ? giftData.bank_name : '',
            account_number: giftData.type !== 'Kirim Kado' ? giftData.account_number : '',
            account_name: giftData.type !== 'Kirim Kado' ? giftData.account_name : '',
            ewallet_name: giftData.type === 'E-Wallet' ? giftData.ewallet_name : '',
            address: giftData.type === 'Kirim Kado' ? giftData.address : '',
          });
        }
      }

      localStorage.removeItem('nikahyuk_creation_draft');
      if (editId) {
        localStorage.removeItem(`nikahyuk_edit_draft_${editId}`);
      }
      alert(editId ? 'Selamat! Undangan digital Anda berhasil diperbarui.' : 'Selamat! Undangan digital Anda berhasil dibuat dan diterbitkan.');
      navigate('/dashboard/invitations');
    } catch (err: any) {
      console.error('Failure saving invitation data:', err);
      alert(`Gagal menyimpan invitation: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Desain' },
    { num: 2, label: 'Mempelai' },
    { num: 3, label: 'Acara' },
    { num: 4, label: 'Media' },
    { num: 5, label: 'Hadiah' },
    { num: 6, label: 'Kirim' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard/invitations')}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {editId ? `Sunting Undangan: ${mempelai.groom_name || ''} & ${mempelai.bride_name || ''}` : 'Buat Undangan Baru'}
          </h1>
          <p className="text-sm text-gray-500">
            {editId ? 'Perbarui rincian, tema, informasi mempelai, acara, galeri, dan hadiah pernikahan Anda.' : 'Buat rancangan undangan pernikahan digital Anda secara mandiri.'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Asisten Pintar Aktif
        </div>
      </div>

      {hasRestoredDraft && !editId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-350 shadow-sm mb-6">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>✍️ Melanjutkan rancangan draf pengisian terakhir Anda yang tersimpan otomatis.</span>
          </div>
          <button 
            type="button"
            onClick={handleClearDraft}
            className="text-[11px] font-extrabold text-red-600 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition active:scale-95 cursor-pointer"
          >
            Mulai Ulang (Hapus Draf)
          </button>
        </div>
      )}

      {/* Steps Indicator Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100 -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 transition-all duration-300 -z-10"
            style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
          />
          
          {stepsList.map((step) => {
            const isCompleted = activeStep > step.num;
            const isActive = activeStep === step.num;
            return (
              <div key={step.num} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Let user navigate only back or to next logical step if validated
                    if (step.num < activeStep) {
                      setActiveStep(step.num);
                    } else if (step.num > activeStep) {
                      // Trigger validation
                      const err = getStepError();
                      if (!err) {
                        setActiveStep(step.num);
                      }
                    }
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition ${
                    isCompleted 
                      ? 'bg-primary-500 text-white' 
                      : isActive 
                        ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-500 ring-offset-2' 
                        : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </button>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Container Wizard */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm min-h-[420px] flex flex-col justify-between mb-6">
        
        {/* STEP 1: SELECT COLOURED DESIGN TEMPLATE */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pilih Desain Template</h2>
              <p className="text-sm text-gray-500 mt-1">Sesuaikan tema undangan berdasarkan karakteristik sakral pernikahan Anda.</p>
            </div>

            {fetchingTemplates ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-2" />
                <p className="text-sm text-gray-500">Mengambil daftar template eksklusif...</p>
              </div>
            ) : (
              <>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { key: 'All', label: 'Semua Tema' },
                    { key: 'Typography', label: '📖 Tanpa Foto (Tipografi)' },
                    { key: 'Classic', label: '👑 Classic' },
                    { key: 'Rustic', label: '🌿 Rustic' },
                    { key: 'Minimalist', label: '📐 Minimalist' },
                    { key: 'Islamic', label: '🕌 Islamic' },
                    { key: 'Floral', label: '💐 Floral' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div 
                      key={tpl.id || tpl.slug}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`group cursor-pointer rounded-2xl border overflow-hidden bg-white transition relative ${
                        isSelected 
                          ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                        <img 
                          src={tpl.thumbnail_url} 
                          alt={tpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full font-bold text-gray-700 tracking-wider uppercase">
                          {tpl.category}
                        </span>
                        
                        {/* Package Badge overlay */}
                        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 select-none">
                          {Number(tpl.price) === 99000 ? '👑 Gold' : Number(tpl.price) === 149000 ? '✨ Platinum' : '🤍 Silver'}
                        </span>

                        {isSelected && (
                          <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-primary-500 text-white rounded-full p-2 shadow-lg">
                              <Check className="w-5 h-5 font-bold" />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition truncate">{tpl.name}</h4>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="text-gray-500">Premium</span>
                          <span className="font-bold text-gray-900">
                            {Number(tpl.price) === 0 || Number(tpl.price) === 49000 ? '🤍 Silver (Bawaan)' : `Rp ${Number(tpl.price).toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: WEDDING BRIDE & GROOM BIODATA */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informasi Mempelai</h2>
              <p className="text-sm text-gray-500 mt-1">Lengkapi nama lengkap dan kutipan suci Anda.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mempelai Pria */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-primary-600 font-bold text-base border-b border-gray-200 pb-2">
                  <Heart className="w-4 h-4 fill-current" /> Mempelai Pria (Groom)
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Pria</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Yusuf, S.T."
                    value={mempelai.groom_name}
                    onChange={(e) => setMempelai(prev => ({ ...prev, groom_name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Orang Tua (Ayah & Ibu)</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Putra dari Bpk. Bambang & Ibu Aminah"
                    value={mempelai.groom_parent}
                    onChange={(e) => setMempelai(prev => ({ ...prev, groom_parent: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Foto Profil Mempelai Pria</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border border-gray-300 bg-white overflow-hidden flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-inner">
                      {groomPhotoPreview ? (
                        <img src={groomPhotoPreview} className="w-full h-full object-cover" />
                      ) : (
                        'Tanpa Foto'
                      )}
                    </div>
                    <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition select-none">
                      Pilih Foto Pria
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden" 
                        onChange={handleGroomPhotoChange} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Mempelai Wanita */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-primary-600 font-bold text-base border-b border-gray-200 pb-2">
                  <Heart className="w-4 h-4 fill-current" /> Mempelai Wanita (Bride)
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Wanita</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Siti Aisyah, S.Kom."
                    value={mempelai.bride_name}
                    onChange={(e) => setMempelai(prev => ({ ...prev, bride_name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Orang Tua (Ayah & Ibu)</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Putri dari Bpk. Hartono & Ibu Fatimah"
                    value={mempelai.bride_parent}
                    onChange={(e) => setMempelai(prev => ({ ...prev, bride_parent: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Foto Profil Mempelai Wanita</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border border-gray-300 bg-white overflow-hidden flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-inner">
                      {bridePhotoPreview ? (
                        <img src={bridePhotoPreview} className="w-full h-full object-cover" />
                      ) : (
                        'Tanpa Foto'
                      )}
                    </div>
                    <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition select-none">
                      Pilih Foto Wanita
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden" 
                        onChange={handleBridePhotoChange} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote / Ayat Pengantar */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kutipan / Ayat Suci Pembuka</label>
              <textarea 
                rows={3}
                required
                value={mempelai.quote}
                onChange={(e) => setMempelai(prev => ({ ...prev, quote: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Tulis kutipan ayat suci atau kata-kata penyatu cinta kalian..."
              />
            </div>

            {/* Love Story / Kisah Cinta */}
            <div className="bg-gradient-to-br from-rose-50/40 to-pink-50/30 p-6 rounded-2xl border border-rose-100">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Kisah Cinta Kami <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
              </label>
              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                Ceritakan perjalanan cinta kalian berdua, mulai dari awal perkenalan hingga keputusan untuk menikah. Kolom ini bersifat opsional — jika dikosongkan, seksi kisah cinta tidak akan ditampilkan pada undangan.
              </p>
              <textarea 
                rows={4}
                value={mempelai.love_story}
                onChange={(e) => setMempelai(prev => ({ ...prev, love_story: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white/80"
                placeholder="Contoh: Kami bertemu pertama kali pada tahun 2020 di bangku kuliah universitas..."
              />
            </div>
          </div>
        )}

        {/* STEP 3: EVENT DETAILS (AKAD & RESEPSI) */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail Acara Sakral</h2>
              <p className="text-sm text-gray-500 mt-1">Lengkapi informasi jadwal, waktu, dan lokasi tempat pelaksanaan resepsi dan akad.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Akad Nikah */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-base border-b border-gray-200 pb-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary-500" /> Akad Nikah
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal</label>
                      <input 
                        type="date"
                        required
                        value={eventAkad.date}
                        onChange={(e) => setEventAkad(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                        <input 
                          type="time"
                          value={eventAkad.start_time}
                          onChange={(e) => setEventAkad(prev => ({ ...prev, start_time: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                        <input 
                          type="time"
                          value={eventAkad.end_time}
                          onChange={(e) => setEventAkad(prev => ({ ...prev, end_time: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nama Tempat / Gedung</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Masjid Agung Al-Azhar"
                        value={eventAkad.location_name}
                        onChange={(e) => setEventAkad(prev => ({ ...prev, location_name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Contoh: Jalan Sisingamangaraja No.1, Kebayoran Baru, Jakarta Selatan"
                        value={eventAkad.address}
                        onChange={(e) => setEventAkad(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        Umat Google Maps URL <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                      </label>
                      <input 
                        type="url"
                        placeholder="Contoh: https://maps.app.goo.gl/..."
                        value={eventAkad.google_maps_url}
                        onChange={(e) => setEventAkad(prev => ({ ...prev, google_maps_url: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resepsi Pernikahan */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-base border-b border-gray-200 pb-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary-500" /> Resepsi Pernikahan
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal</label>
                      <input 
                        type="date"
                        required
                        value={eventResepsi.date}
                        onChange={(e) => setEventResepsi(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                        <input 
                          type="time"
                          value={eventResepsi.start_time}
                          onChange={(e) => setEventResepsi(prev => ({ ...prev, start_time: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                        <input 
                          type="time"
                          value={eventResepsi.end_time}
                          onChange={(e) => setEventResepsi(prev => ({ ...prev, end_time: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nama Tempat / Gedung</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Balai Kartini Grand Ballroom"
                        value={eventResepsi.location_name}
                        onChange={(e) => setEventResepsi(prev => ({ ...prev, location_name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Contoh: Jenderal Gatot Subroto Kav. 37, kuningan timur, jakarta selatan"
                        value={eventResepsi.address}
                        onChange={(e) => setEventResepsi(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                        Link Google Maps <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                      </label>
                      <input 
                        type="url"
                        placeholder="Contoh: https://maps.app.goo.gl/..."
                        value={eventResepsi.google_maps_url}
                        onChange={(e) => setEventResepsi(prev => ({ ...prev, google_maps_url: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MEDIA UPLOAD TO STORAGE */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Media Galeri & Musik</h2>
              <p className="text-sm text-gray-500 mt-1">Unggah foto sampul utama/preview WhatsApp, galeri dokumentasi prewedding, dan musik latar romantis Anda.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Social Media Card WA & Background Music */}
              <div className="space-y-6">
                {/* Whatsapp Card preview URL */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-primary-100 ring-2 ring-primary-500 ring-opacity-5">
                  <label className="block text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-1.5">
                    ✨ Foto Sampul Utama (Cover Undangan) & WhatsApp Preview
                  </label>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Unggah foto terindah kalian berdua. Gambar ini akan dipasang megah sebagai <strong>foto sampul depan/latar belakang cover (Cover Hero)</strong> di undangan digital Anda, sekaligus sebagai gambar pratayang (preview) ketika tautan undangan dibagikan di WhatsApp.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {waThumbnailUrl ? (
                        <img src={waThumbnailUrl} alt="WA Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Pilih Gambar
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden" 
                        onChange={handleWaThumbnailChange} 
                      />
                    </label>
                  </div>
                </div>

                {/* Music Upload */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Musik Pengiring (BGM)</label>
                  <p className="text-xs text-gray-500 mb-4 font-normal">Pilih musik berformat MP3 (maks 10MB) untuk mengiringi tamu saat membaca rincian undangan cinta kalian.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {activePackage === 'silver' ? 'Latar Musik Bawaan (Instrumen)' : (musicFileName || 'Belum memilih musik')}
                      </p>
                      <p className="text-[10px] text-gray-550">
                        {activePackage === 'silver' ? 'Terkunci (Paket Silver)' : 'Hanya file MP3'}
                      </p>
                    </div>
                    {activePackage === 'silver' ? (
                      <button
                        type="button"
                        onClick={() => alert('Unggah musik kustom hanya tersedia untuk paket Gold & Platinum. Silakan upgrade paket Anda.')}
                        className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" /> Terkunci
                      </button>
                    ) : (
                      <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
                        Pilih MP3
                        <input 
                          type="file" 
                          accept="audio/mp3, audio/mpeg"
                          className="hidden" 
                          onChange={handleMusicChange} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Photos Gallery Multi-Upload */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-900">Galeri Foto Pernikahan</label>
                    <span className="text-[10px] text-gray-500 font-bold bg-white border px-2 py-0.5 rounded-full">
                      {galleryItems.length} / {activePackage === 'silver' ? '3' : activePackage === 'gold' ? '8' : '12'} Foto
                    </span>
                  </div>
                  <p className="text-xs text-gray-550 mb-4">
                    Unggah kumpulan foto prewedding terbaik Anda (Maksimal {activePackage === 'silver' ? '3' : activePackage === 'gold' ? '8' : '12'} Foto untuk Paket {activePackage.toUpperCase()}).
                  </p>

                  <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto mb-4 pr-1">
                    {galleryItems.map((item, index) => (
                      <div key={index} className="aspect-square rounded-xl border border-gray-200 bg-white relative group overflow-hidden shadow-sm">
                        <img src={item.preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col items-center justify-center p-2 text-center text-[10px]">
                          <input 
                            type="text" 
                            placeholder="Kepsyen..."
                            value={item.caption}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            className="bg-transparent border-b border-white text-white focus:outline-none w-full text-center mb-2 placeholder-gray-300"
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="text-red-400 hover:text-red-300 flex items-center justify-center bg-white/10 rounded-full p-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 transition cursor-pointer flex flex-col items-center justify-center gap-1 bg-white">
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 text-center">Tambah</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden" 
                        onChange={handleAddGalleryImage} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: WEDDING GIFT (BANK ACCOUNTS & SHIPPING ADDRESSES) */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Amplop Digital & Kado</h2>
              <p className="text-sm text-gray-500 mt-1">Sediakan bank transfer atau e-wallet untuk kado pernikahan tanpa tatap muka bagi kerabat jauh.</p>
            </div>

            {activePackage === 'silver' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
                <Gift className="w-12 h-12 text-amber-500 mx-auto" />
                <h4 className="font-bold text-amber-800">Fitur Kado Digital Terkunci</h4>
                <p className="text-xs text-amber-600 max-w-md mx-auto leading-relaxed">
                  Fitur E-Gift, Transfer Rekening, dan Kado Fisik hanya tersedia untuk kustomer paket <strong>Gold & Platinum</strong>. Silakan upgrade paket Anda untuk mengaktifkan modul ini.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {giftsList.map((gift, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 relative">
                      <button 
                        type="button"
                        onClick={() => handleRemoveGift(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Metode Hadiah</label>
                          <select 
                            value={gift.type}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Kirim Kado' && activePackage === 'gold') {
                                alert("Metode 'Kirim Kado Fisik' hanya tersedia untuk paket Platinum. Silakan pilih Transfer Bank atau E-Wallet.");
                                return;
                              }
                              handleGiftFieldChange(index, 'type', val);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-primary-500 text-xs font-bold bg-white"
                          >
                            <option value="Bank">Transfer Bank</option>
                            <option value="E-Wallet">Dompet Digital (E-Wallet)</option>
                            {activePackage === 'platinum' ? (
                              <option value="Kirim Kado">Kirim Kado Fisik</option>
                            ) : (
                              <option value="Kirim Kado" disabled>Kirim Kado Fisik (Hanya Platinum)</option>
                            )}
                          </select>
                        </div>

                        {gift.type === 'Bank' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Nama Bank</label>
                              <select 
                                value={gift.bank_name}
                                onChange={(e) => handleGiftFieldChange(index, 'bank_name', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-primary-500 text-xs bg-white"
                              >
                                <option value="BCA">Bank Central Asia (BCA)</option>
                                <option value="Mandiri">Bank Mandiri</option>
                                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Rekening & Nama Pemilik</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  placeholder="No. Rekening"
                                  required
                                  value={gift.account_number}
                                  onChange={(e) => handleGiftFieldChange(index, 'account_number', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Nama Pemilik"
                                  required
                                  value={gift.account_name}
                                  onChange={(e) => handleGiftFieldChange(index, 'account_name', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {gift.type === 'E-Wallet' && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Pilih E-Wallet</label>
                              <select 
                                value={gift.ewallet_name}
                                onChange={(e) => handleGiftFieldChange(index, 'ewallet_name', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-primary-500 text-xs bg-white"
                              >
                                <option value="GoPay">GoPay</option>
                                <option value="OVO">OVO</option>
                                <option value="Dana">DANA</option>
                                <option value="ShopeePay">ShopeePay</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor HP & Atas Nama</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" 
                                  placeholder="No. HP"
                                  required
                                  value={gift.account_number}
                                  onChange={(e) => handleGiftFieldChange(index, 'account_number', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Nama Terdaftar"
                                  required
                                  value={gift.account_name}
                                  onChange={(e) => handleGiftFieldChange(index, 'account_name', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {gift.type === 'Kirim Kado' && (
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap Pengiriman Hadiah Fisik</label>
                            <input 
                              type="text" 
                              placeholder="Jalan, RT/RW, Kecamatan, Kota, Kode Pos"
                              required
                              value={gift.address}
                              onChange={(e) => handleGiftFieldChange(index, 'address', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={handleAddGift}
                  className="mt-2 w-full border border-dashed border-gray-300 rounded-xl py-3 text-xs font-bold text-gray-600 hover:border-primary-500 hover:text-primary-500 transition flex items-center justify-center gap-1 bg-white"
                >
                  <Plus className="w-4 h-4" /> Tambah Rekening / Alamat Pengiriman
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 6: SLUG CUSTOMIZATION & FINAL DEPLOY REVIEW */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ulasan & Kustomisasi URL</h2>
              <p className="text-sm text-gray-500 mt-1">Periksa kembali detail undangan cinta Anda sebelum dikirimkan ke dunia luar secara resmi.</p>
            </div>

            {/* Custom URL text box validation info */}
            <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100 flex flex-col gap-4">
              <label className="block text-sm font-bold text-gray-900 mb-1">Tentukan Link URL Undangan (Slug)</label>
              
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-inner">
                <span className="text-xs font-bold text-gray-400 select-none">nikahyuk.id/</span>
                <input 
                  type="text"
                  required
                  placeholder="fulan-fulanah"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
                  className="flex-1 bg-transparent text-xs font-extrabold text-primary-700 focus:outline-none"
                />
                
                {customSlug && (
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {checkingSlug ? (
                      <span className="text-gray-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> cek...</span>
                    ) : slugExists ? (
                      <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Sudah Dipakai</span>
                    ) : (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Tersedia</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-[11px] text-gray-500 flex items-start gap-1">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Link di atas akan menjadi alamat utama bagi para tamu undangan untuk melihat rincian undangan sakral pernikahan Anda secara real-time.</span>
              </div>
            </div>

            {/* Pratinjau Undangan di Tab Baru */}
            <div className="flex items-center justify-between bg-amber-50/55 border border-amber-200 rounded-2xl p-4 shadow-sm">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pratinjau Undangan Terlebih Dahulu</h4>
                <p className="text-[11px] text-gray-500">Lihat hasil akhir rancangan Anda di tab baru sebelum resmi diterbitkan.</p>
              </div>
              <button
                type="button"
                onClick={handlePreviewNewTab}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary-500" /> Pratinjau di Tab Baru
              </button>
            </div>

            {/* Visual Bento Box Review Data */}
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 divide-y divide-gray-200/60 max-h-[190px] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Tema Terpilih</span>
                  <p className="text-xs font-bold text-gray-900">{selectedTemplate?.name || 'Klasik'}</p>
                </div>
                <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">Published</span>
              </div>
              
              <div className="pt-3 grid grid-cols-2 gap-4 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Mempelai Pria & Orang Tua</span>
                  <p className="text-xs font-bold text-gray-900 truncate">{mempelai.groom_name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{mempelai.groom_parent}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Mempelai Wanita & Orang Tua</span>
                  <p className="text-xs font-bold text-gray-900 truncate">{mempelai.bride_name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{mempelai.bride_parent}</p>
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Jadwal Akad</span>
                  <p className="text-xs font-bold text-gray-900 truncate">{eventAkad.date} • {eventAkad.start_time} WIB</p>
                  <p className="text-[10px] text-gray-500 truncate">{eventAkad.location_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Jadwal Resepsi</span>
                  <p className="text-xs font-bold text-gray-900 truncate">{eventResepsi.date} • {eventResepsi.start_time} WIB</p>
                  <p className="text-[10px] text-gray-500 truncate">{eventResepsi.location_name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Buttons Handler footer */}
        <div className="border-t border-gray-150 pt-6 mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 1 || loading}
            onClick={handlePrev}
            className={`flex items-center gap-1 text-sm font-bold px-5 py-2.5 rounded-xl border border-gray-200 transition ${
              activeStep === 1 || loading
                ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>

          {activeStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Lanjutkan <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || checkingSlug || (slugExists === true)}
              onClick={handleSubmit}
              className={`flex items-center gap-1.5 text-sm font-extrabold bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl transition shadow-md ${
                (loading || checkingSlug || (slugExists === true)) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> {editId ? 'Simpan Perubahan' : 'Terbitkan Undangan'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Glassmorphic Image Cropper & Resizer Modal */}
      {showCropper && cropperType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCropper(false)} />
          
          {/* Container */}
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 p-6 z-10 flex flex-col items-center animate-in scale-in duration-200">
            <h3 className="text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" /> Sesuaikan & Posisikan Foto
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Seret/geser foto untuk mengatur posisinya, dan gunakan slider di bawah untuk memperbesar atau mengecilkan agar pas dengan desain template.
            </p>
            
            {/* Viewport crop mask canvas wrapper */}
            <div 
              className="relative border-4 border-gray-100 bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center cursor-move"
              style={{ 
                width: `${maskW}px`, 
                height: `${maskH}px`,
                borderRadius: cropperType === 'cover' ? '24px' : '9999px' // Circular mask for groom/bride, rounded rect for cover
              }}
              onMouseDown={handleCropperMouseDown}
              onMouseMove={handleCropperMouseMove}
              onMouseUp={handleCropperMouseUp}
              onMouseLeave={handleCropperMouseUp}
              onTouchStart={handleCropperTouchStart}
              onTouchMove={handleCropperTouchMove}
              onTouchEnd={handleCropperMouseUp}
            >
              {/* Inner Circular frame indicator overlay for profiles */}
              {cropperType !== 'cover' && (
                <div className="absolute inset-0 border-2 border-primary-500/30 rounded-full z-10 pointer-events-none" />
              )}
              
              {/* Image element */}
              <img 
                src={cropperImageSrc} 
                alt="Cropping item"
                className="select-none pointer-events-none max-w-none"
                style={{
                  width: `${baselineW}px`,
                  height: `${baselineH}px`,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${cropperOffset.x}px), calc(-50% + ${cropperOffset.y}px)) scale(${cropperZoom})`,
                  transformOrigin: 'center center',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              />
            </div>
            
            {/* Slider zoom bar */}
            <div className="w-full mt-6 space-y-2 px-4">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Perkecil</span>
                <span>Zoom: {Math.round(cropperZoom * 100)}%</span>
                <span>Perbesar</span>
              </div>
              <input 
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={cropperZoom}
                onChange={(e) => setCropperZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
              />
            </div>
            
            {/* Action buttons */}
            <div className="w-full flex items-center justify-end gap-3 mt-8 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={() => {
                  try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                      throw new Error('Gagal menginisialisasi context canvas 2D.');
                    }
                    
                    // Validate numbers defensively to prevent NaN runtime crashes
                    const currentZoom = Number(cropperZoom) || 1;
                    const offsetX = Number(cropperOffset.x) || 0;
                    const offsetY = Number(cropperOffset.y) || 0;
                    
                    const finalBaselineW = Number(baselineW) || maskW;
                    const finalBaselineH = Number(baselineH) || maskH;
                    
                    canvas.width = targetW;
                    canvas.height = targetH;
                    
                    const scaleFactor = targetW / maskW;
                    const drawW = finalBaselineW * scaleFactor * currentZoom;
                    const drawH = finalBaselineH * scaleFactor * currentZoom;
                    const drawX = (targetW / 2) - (drawW / 2) + (offsetX * scaleFactor);
                    const drawY = (targetH / 2) - (drawH / 2) + (offsetY * scaleFactor);
                    
                    // Perform validation to ensure finite values
                    if (!isFinite(drawW) || !isFinite(drawH) || !isFinite(drawX) || !isFinite(drawY)) {
                      throw new Error('Dimensi gambar tidak valid (non-finite).');
                    }
                    
                    const img = new Image();
                    img.src = cropperImageSrc;
                    img.onerror = () => {
                      alert('Gagal memuat gambar untuk proses pemotongan.');
                    };
                    img.onload = () => {
                      try {
                        // Fill background white in case of transparent background PNGs
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, targetW, targetH);
                        
                        ctx.drawImage(img, drawX, drawY, drawW, drawH);
                        
                        canvas.toBlob((blob) => {
                          try {
                            if (blob) {
                              const croppedFile = new File([blob], `${cropperType}_photo.jpg`, { type: 'image/jpeg' });
                              const base64Data = canvas.toDataURL('image/jpeg', 0.85);
                              if (cropperType === 'groom') {
                                setGroomPhotoFile(croppedFile);
                                setGroomPhotoPreview(base64Data);
                              } else if (cropperType === 'bride') {
                                setBridePhotoFile(croppedFile);
                                setBridePhotoPreview(base64Data);
                              } else if (cropperType === 'cover') {
                                setWaThumbnail(croppedFile);
                                setWaThumbnailUrl(base64Data);
                              }
                            }
                            setShowCropper(false);
                          } catch (blobErr: any) {
                            console.error('Error in toBlob callback:', blobErr);
                            alert(`Gagal menyimpan berkas gambar: ${blobErr.message || blobErr}`);
                            setShowCropper(false);
                          }
                        }, 'image/jpeg', 0.95);
                      } catch (drawErr: any) {
                        console.error('Error drawing cropped image:', drawErr);
                        alert(`Gagal memproses gambar: ${drawErr.message || drawErr}`);
                        setShowCropper(false);
                      }
                    };
                  } catch (err: any) {
                    console.error('Error in cropper apply handler:', err);
                    alert(`Gagal memproses penyuntingan gambar: ${err.message || err}`);
                    setShowCropper(false);
                  }
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Terapkan & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
