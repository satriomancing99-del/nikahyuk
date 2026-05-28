import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Heart, Calendar, MapPin, Music, Volume2, VolumeX, MailOpen, Clock, 
  Map, Gift, MessageSquare, Check, Copy, Send, HelpCircle, Loader2, 
  ChevronDown, QrCode, Lock
} from 'lucide-react';
// @ts-ignore
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Invitation, Event as DBEvent, Gift as DBGift, Media, Wish, Guest } from '../types/database.types';

// Mock data for previewing template designs
const MOCK_INVITATION: Invitation = {
  id: 'preview-inv',
  user_id: 'preview-user',
  template_id: 'preview-tpl',
  slug: 'preview',
  groom_name: 'Aditya Pratama',
  bride_name: 'Aulia Rahmawati',
  groom_parent: 'Bpk. Heri Pratama & Ibu Shinta',
  bride_parent: 'Bpk. Ahmad Rahmawan & Ibu Lestari',
  quote: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.',
  love_story: `Awal Pertemuan (2020)
Kita dipertemukan pertama kali di bangku perkuliahan, berawal dari kerja kelompok yang membawa kesamaan minat.

Menjalin Komitmen (2022)
Setelah dua tahun saling mengenal karakter masing-masing, kami membulatkan tekad untuk menjalin komitmen lebih serius.

Melangkah ke Pelaminan (2026)
Hari ini kami mengikat benang suci pernikahan, melangkah bersama dalam rida Allah SWT.`,
  music_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
  status: 'active',
  expired_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_EVENTS = [
  {
    id: 'evt-1',
    invitation_id: 'preview-inv',
    type: 'akad',
    title: 'Akad Nikah Suci',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:30',
    location_name: 'Masjid Agung Al-Kautsar',
    address: 'Jl. Sudirman No. 102, Kebayoran Baru, Jakarta Selatan',
    google_maps_url: 'https://maps.google.com',
    created_at: new Date().toISOString()
  },
  {
    id: 'evt-2',
    invitation_id: 'preview-inv',
    type: 'resepsi',
    title: 'Resepsi Kebahagiaan',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    start_time: '11:00',
    end_time: '14:00',
    location_name: 'Grand Ballroom Sentosa',
    address: 'Kawasan Sentosa Business Park Kav 4-5, Jakarta Selatan',
    google_maps_url: 'https://maps.google.com',
    created_at: new Date().toISOString()
  }
];

const MOCK_GIFTS = [
  {
    id: 'gft-1',
    invitation_id: 'preview-inv',
    type: 'Bank',
    bank_name: 'BCA',
    account_number: '1234567890',
    account_name: 'Aditya Pratama',
    ewallet_name: '',
    address: '',
    created_at: new Date().toISOString()
  },
  {
    id: 'gft-2',
    invitation_id: 'preview-inv',
    type: 'Bank',
    bank_name: 'Mandiri',
    account_number: '9876543210',
    account_name: 'Aulia Rahmawati',
    ewallet_name: '',
    address: '',
    created_at: new Date().toISOString()
  }
];

const MOCK_GALLERY = [
  { id: 'm-1', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400', caption: 'Pertemuan Pertama', sort_order: 1, created_at: '' },
  { id: 'm-2', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400', caption: 'Momen Lamaran', sort_order: 2, created_at: '' },
  { id: 'm-3', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400', caption: 'Sesi Prewedding', sort_order: 3, created_at: '' },
  { id: 'm-4', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=400', caption: 'Bersama Selamanya', sort_order: 4, created_at: '' },
  { id: 'gp-mock', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400', caption: 'groom_photo', sort_order: -1, created_at: '' },
  { id: 'bp-mock', invitation_id: 'preview-inv', url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=400', caption: 'bride_photo', sort_order: -2, created_at: '' }
];

const MOCK_WISHES = [
  { id: 'w-1', invitation_id: 'preview-inv', guest_name: 'Rian Kurniawan', message: 'Selamat menempuh hidup baru Adit & Aulia! Semoga rukun selalu ya.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'w-2', invitation_id: 'preview-inv', guest_name: 'Sarah Amalia', message: 'Happy Wedding! Wishing you a lifetime of love and happiness together.', created_at: new Date(Date.now() - 7200000).toISOString() }
];

// Safe Error Boundary to prevent dynamic template runtime render errors from crashing the entire React app
class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Custom Template Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

export default function PublicInvitation() {
  const { invitationSlug, templateSlug } = useParams<{ invitationSlug?: string; templateSlug?: string }>();
  const [searchParams] = useSearchParams();
  const guestCode = searchParams.get('guest');

  // Core States
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [gifts, setGifts] = useState<DBGift[]>([]);
  const [gallery, setGallery] = useState<Media[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [templateCategory, setTemplateCategory] = useState<string>('Classic');

  // Custom JSX Sandbox compilation states
  const [customJsxCode, setCustomJsxCode] = useState<string | null>(null);
  const [babelReady, setBabelReady] = useState(false);
  const [CustomComponent, setCustomComponent] = useState<React.ComponentType<any> | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  // Invitation Open Overlay state
  const [isOpen, setIsOpen] = useState(() => {
    return window.location.pathname.startsWith('/preview');
  });
  
  // Background Music
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown clock state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form States
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    attendance: 'attending', // attending | declined
    totalGuests: '1',
    message: ''
  });
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Independent Wish Wall post state
  const [wishForm, setWishForm] = useState({
    name: '',
    message: ''
  });
  const [wishSubmitting, setWishSubmitting] = useState(false);

  // Copy Account details indicator
  const [copiedGiftId, setCopiedGiftId] = useState<string | null>(null);

  // Fetch Invitation & related details
  useEffect(() => {
    async function loadData() {
      const path = window.location.pathname;
      const isPreviewMode = !!templateSlug || path.startsWith('/preview');
      const activeSlug = templateSlug || invitationSlug || path.split('/').pop() || '';

      if (isPreviewMode) {
        setLoading(true);

        const isDraftPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        if (isDraftPreview) {
          const draftStr = localStorage.getItem('draft_invitation_preview');
          if (draftStr) {
            try {
              const draft = JSON.parse(draftStr);
              setInvitation(draft.invitation);
              setEvents(draft.events);
              
              const draftGifts = draft.gifts || [];
              const validDraftGifts = draftGifts.filter((g: any) => {
                if (g.type === 'Bank' || g.type === 'E-Wallet') {
                  return g.account_number?.trim() && g.account_name?.trim();
                } else if (g.type === 'Kirim Kado') {
                  return g.address?.trim();
                }
                return false;
              });
              setGifts(validDraftGifts);
              
              setGallery(draft.gallery);
              setWishes(draft.wishes || MOCK_WISHES);
              setGuest(draft.guest || {
                id: 'mock-guest-id',
                invitation_id: 'preview-inv',
                name: 'Budi Santoso & Pasangan',
                phone: '628123456789',
                guest_code: 'NY-BUDI-01',
                personal_link: 'https://nikahyuk.id/preview?guest=NY-BUDI-01',
                qr_code_value: 'NY-BUDI-01',
                sent_status: 'sent',
                opened_at: new Date().toISOString(),
                rsvp_status: 'pending',
                checkin_status: 'pending',
                created_at: new Date().toISOString()
              });

              if (draft.template?.jsx_code) {
                setCustomJsxCode(draft.template.jsx_code);
              } else if (activeSlug) {
                const { data: tpl } = await supabase
                  .from('templates')
                  .select('jsx_code')
                  .eq('slug', activeSlug)
                  .single();
                if (tpl?.jsx_code) {
                  setCustomJsxCode(tpl.jsx_code);
                }
              }
              setLoading(false);
              return;
            } catch (e) {
              console.error('Error loading draft preview:', e);
            }
          }
        }
        
        // 1. Check if there is a draft template in localStorage matching activeSlug
        const localDraft = localStorage.getItem(`draft_template_${activeSlug}`);
        let finalTpl = null;
        if (localDraft) {
          try {
            finalTpl = JSON.parse(localDraft);
          } catch (e) {
            console.error('Error parsing local draft template:', e);
          }
        }

        // Set mock data
        setInvitation({
          ...MOCK_INVITATION,
          slug: activeSlug
        });
        setEvents(MOCK_EVENTS);
        setGifts(MOCK_GIFTS);
        setGallery(MOCK_GALLERY);
        setWishes(MOCK_WISHES);

        // Add high-fidelity mock guest for template previewing
        setGuest({
          id: 'mock-guest-id',
          invitation_id: 'preview-inv',
          name: 'Budi Santoso & Pasangan',
          phone: '628123456789',
          guest_code: 'NY-BUDI-01',
          personal_link: 'https://nikahyuk.id/preview?guest=NY-BUDI-01',
          qr_code_value: 'NY-BUDI-01',
          sent_status: 'sent',
          opened_at: new Date().toISOString(),
          rsvp_status: 'pending',
          checkin_status: 'pending',
          created_at: new Date().toISOString()
        });

        // Detect category base from slug
        let detectedCategory = 'Classic';
        const lowerSlug = activeSlug.toLowerCase();
        if (lowerSlug.includes('rustic') || lowerSlug.includes('modern-botanical')) {
          detectedCategory = 'Rustic';
        } else if (lowerSlug.includes('minimalist') || lowerSlug.includes('premium-gold')) {
          detectedCategory = 'Minimalist';
        } else if (lowerSlug.includes('islamic')) {
          detectedCategory = 'Islamic';
        } else if (lowerSlug.includes('floral')) {
          detectedCategory = 'Floral';
        } else if (lowerSlug.includes('modern')) {
          detectedCategory = 'Modern';
        }

        if (finalTpl) {
          detectedCategory = finalTpl.category || detectedCategory;
          if (finalTpl.jsx_code) {
            setCustomJsxCode(finalTpl.jsx_code);
          }
        } else {
          try {
            // Attempt to fetch from database templates
            const { data: tpl } = await supabase
              .from('templates')
              .select('*')
              .eq('slug', activeSlug)
              .single();
            if (tpl) {
              detectedCategory = tpl.category;
              if (tpl.jsx_code) {
                setCustomJsxCode(tpl.jsx_code);
              }
            }
          } catch (e) {
            console.warn('Could not load template category from Supabase, applying default matching.', e);
          }
        }

        setTemplateCategory(detectedCategory);
        setLoading(false);
        return;
      }

      if (!invitationSlug) {
        setErrorText('Slug undangan tidak valid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch core invitation
        const { data: inv, error: invErr } = await supabase
          .from('invitations')
          .select('*')
          .eq('slug', invitationSlug)
          .single();

        if (invErr || !inv) {
          setErrorText('Mohon maaf, halaman undangan digital tidak ditemukan.');
          setLoading(false);
          return;
        }

        setInvitation(inv);

        // Fetch associated template to style theme dynamically
        if (inv.template_id) {
          try {
            const { data: tpl } = await supabase
              .from('templates')
              .select('*')
              .eq('id', inv.template_id)
              .single();
            if (tpl) {
              setTemplateCategory(tpl.category);
              if (tpl.jsx_code) {
                setCustomJsxCode(tpl.jsx_code);
              }
            }
          } catch (e) {
            console.warn('Could not load dynamic template for invitation style.', e);
          }
        }

        // Fetch remaining relations in parallel
        const [eventsRes, giftsRes, mediaRes, wishesRes] = await Promise.all([
          supabase.from('events').select('*').eq('invitation_id', inv.id).order('date', { ascending: true }),
          supabase.from('gifts').select('*').eq('invitation_id', inv.id).order('created_at', { ascending: true }),
          supabase.from('media').select('*').eq('invitation_id', inv.id).order('sort_order', { ascending: true }),
          supabase.from('wishes').select('*').eq('invitation_id', inv.id).order('created_at', { ascending: false })
        ]);

        setEvents(eventsRes.data || []);
        
        // Filter out empty placeholder gifts dynamically to prevent rendering blank cards
        const dbGifts = giftsRes.data || [];
        const validDbGifts = dbGifts.filter((g: any) => {
          if (g.type === 'Bank' || g.type === 'E-Wallet') {
            return g.account_number?.trim() && g.account_name?.trim();
          } else if (g.type === 'Kirim Kado') {
            return g.address?.trim();
          }
          return false;
        });
        setGifts(validDbGifts);
        
        setGallery(mediaRes.data || []);
        setWishes(wishesRes.data || []);

        // Load Guest state if guest parameter exists
        if (guestCode) {
          const { data: gst, error: gstErr } = await supabase
            .from('guests')
            .select('*')
            .eq('invitation_id', inv.id)
            .eq('guest_code', guestCode)
            .single();

          if (gst && !gstErr) {
            setGuest(gst);
            // Pre-fill fields in forms
            setRsvpForm(prev => ({ ...prev, name: gst.name }));
            setWishForm(prev => ({ ...prev, name: gst.name }));

            // Logging tracking: set opened_at timestamp in background if not already opened
            await supabase
              .from('guests')
              .update({ opened_at: new Date().toISOString() })
              .eq('id', gst.id);
          }
        }
      } catch (err: any) {
        console.error('Error fetching wedding details:', err);
        setErrorText('Gagal menyambung ke server. Silakan muat ulang halaman.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [invitationSlug, templateSlug, guestCode]);

  // Dynamic Babel & Tailwind CDN loader effect
  useEffect(() => {
    if (!customJsxCode) return;
    
    // Load Babel Standalone
    if (!(window as any).Babel) {
      const babelScript = document.createElement('script');
      babelScript.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      babelScript.async = true;
      babelScript.onload = () => setBabelReady(true);
      document.body.appendChild(babelScript);
    } else {
      setBabelReady(true);
    }

    // Load Tailwind Play CDN to dynamically compile dynamic/runtime classes in browser
    if (!(window as any).tailwind) {
      const twScript = document.createElement('script');
      twScript.src = 'https://cdn.tailwindcss.com';
      twScript.async = true;
      document.body.appendChild(twScript);
    }
  }, [customJsxCode]);

  // Custom JSX compilation effect
  useEffect(() => {
    if (!customJsxCode || !babelReady) return;
    try {
      const jsxCode = customJsxCode;
      
      // 1. Parse Lucide icons dynamically from imports before we strip them
      const lucideImports: string[] = [];
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
      let match;
      while ((match = importRegex.exec(jsxCode)) !== null) {
        const icons = match[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => s && !s.includes(' as '));
        lucideImports.push(...icons);
      }
      
      // Auto-scan code for any used Lucide icons to prevent errors if the AI forgot to write them in imports
      const codeWords = jsxCode.match(/[A-Z][a-zA-Z0-9]+/g) || [];
      const autoDetectedIcons = Array.from(new Set(codeWords)).filter(word => {
        return (Lucide as any)[word] && (typeof (Lucide as any)[word] === 'object' || typeof (Lucide as any)[word] === 'function');
      });
      
      const uniqueIcons = Array.from(new Set([...lucideImports, ...autoDetectedIcons]));
      
      // Initialize dynamic params with standard icons to ensure backward compatibility
      const defaultIcons = {
        Heart, Calendar, MapPin, Map, Gift, Clock, MessageSquare, Check, Copy, Send, HelpCircle, Loader2, ChevronDown, QrCode, Lock, Music, Volume2, VolumeX, MailOpen
      };
      
      const passedIconNames: string[] = [];
      const passedIconValues: any[] = [];
      
      Object.entries(defaultIcons).forEach(([name, val]) => {
        passedIconNames.push(name);
        passedIconValues.push(val);
      });
      
      // Dynamically resolve and inject unique icons parsed from the custom JSX template
      uniqueIcons.forEach(iconName => {
        if (!passedIconNames.includes(iconName)) {
          // Gracefully fallback to Heart icon to prevent fatal ReferenceErrors if the icon is missing
          const iconComponent = (Lucide as any)[iconName] || Heart;
          passedIconNames.push(iconName);
          passedIconValues.push(iconComponent);
        }
      });

      // 2. Clean all imports (with or without 'from') and exports
      const cleanedCode = jsxCode
        .replace(/import\s+([\s\S]*?from\s+)?['"].*?['"];?/g, '')
        // Clean named export statements like export { MyComponent };
        .replace(/export\s*{[\s\S]*?};?/g, '')
        // Clean inline named exports like export const / export function
        .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
        // Clean default exports
        .replace(/export\s+default\s+function\s+\w+/, 'function CustomInvitationComponent')
        .replace(/export\s+default\s+class\s+\w+/, 'class CustomInvitationComponent')
        .replace(/export\s+default\s+/, 'const CustomInvitationComponent = ');

      // 3. Transpile using Babel standalone
      const transpiled = (window as any).Babel.transform(cleanedCode, {
        presets: ['env', 'react']
      }).code;

      // 4. Create component builder function with full dynamic scope variables
      const builderParams = [
        'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
        ...passedIconNames,
        'motion', 'AnimatePresence',
        `${transpiled}\nreturn CustomInvitationComponent;`
      ];
      
      const builder = new Function(...builderParams);

      // 5. Build the component
      const builderArgs = [
        React, useState, useEffect, useRef, useMemo, useCallback,
        ...passedIconValues,
        motion, AnimatePresence
      ];
      
      const BuiltComp = builder(...builderArgs);

      setCustomComponent(() => BuiltComp);
      setCompileError(null);
    } catch (err: any) {
      console.error('Babel compilation error:', err);
      setCompileError(err.message || 'Gagal merender template kustom.');
    }
  }, [customJsxCode, babelReady]);

  // Audio lifecycle cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Countdown timer logic based on the wedding date (earliest event)
  useEffect(() => {
    if (events.length === 0) return;
    
    // Sort events to pick earliest
    const earliestEvent = [...events].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time || '00:00'}:00`);
      const dateB = new Date(`${b.date}T${b.start_time || '00:00'}:00`);
      return dateA.getTime() - dateB.getTime();
    })[0];

    const targetDate = new Date(`${earliestEvent.date}T${earliestEvent.start_time || '00:00'}:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  // Handle open cover transition & audio playback
  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Smooth scroll bypass to top of main document
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (invitation?.music_url) {
      const audio = new Audio(invitation.music_url);
      audio.loop = true;
      audioRef.current = audio;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Audio auto-playback was blocked by browser. User needs to tap icon.', err);
      });
    }
  };

  // Toggle Background Audio Track
  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handles RSVP Submission safely
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (!rsvpForm.name.trim()) {
      alert('Mohon isi nama lengkap Anda.');
      return;
    }

    try {
      setRsvpSubmitting(true);

      // 1. Submit to rsvps table
      await supabase.from('rsvps').insert({
        invitation_id: invitation.id,
        guest_id: guest?.id || null,
        guest_name: rsvpForm.name.trim(),
        attendance_status: rsvpForm.attendance,
        total_guest: rsvpForm.attendance === 'attending' ? Number(rsvpForm.totalGuests) : 0,
        message: rsvpForm.message.trim()
      });

      // 2. Update status in guests table if guest metadata matches
      if (guest) {
        await supabase
          .from('guests')
          .update({ rsvp_status: rsvpForm.attendance })
          .eq('id', guest.id);
      }

      // 3. If they wrote a wish, post it to the wishes wall too!
      if (rsvpForm.message.trim()) {
        const { data: newWish, error: wishErr } = await supabase
          .from('wishes')
          .insert({
            invitation_id: invitation.id,
            guest_name: rsvpForm.name.trim(),
            message: rsvpForm.message.trim()
          })
          .select()
          .single();

        if (newWish && !wishErr) {
          setWishes(prev => [newWish, ...prev]);
        }
      }

      setRsvpSuccess(true);
      alert('Konfirmasi kehadiran & doa restu Anda berhasil disimpan. Terima kasih.');
    } catch (err) {
      console.error('Error saving RSVP:', err);
      alert('Terjadi kesalahan saat memproses RSVP Anda. Silakan coba kembali.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Dedicated Wishwall Form Submission
  const handleWishWallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      alert('Nama dan ucapan ucapan tidak boleh kosong.');
      return;
    }

    try {
      setWishSubmitting(true);
      const { data: newWish, error: wishErr } = await supabase
        .from('wishes')
        .insert({
          invitation_id: invitation.id,
          guest_name: wishForm.name.trim(),
          message: wishForm.message.trim()
        })
        .select()
        .single();

      if (wishErr || !newWish) throw wishErr;

      setWishes(prev => [newWish, ...prev]);
      setWishForm(prev => ({ ...prev, message: '' }));
      alert('Ucapan selamat berhasil ditambahkan ke Guest Book.');
    } catch (err) {
      console.error('Error posting wish:', err);
      alert('Gagal mengirimkan ucapan Anda.');
    } finally {
      setWishSubmitting(false);
    }
  };

  // Clipboard Copier with Dynamic Checkmarks
  const handleCopyAccount = (number: string, id: string) => {
    navigator.clipboard.writeText(number);
    setCopiedGiftId(id);
    setTimeout(() => setCopiedGiftId(null), 2500);
  };

  // Format Indo dates properly
  const formatIndonesianDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const getThemeStyles = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('rustic') || cat.includes('botanical')) {
      return {
        bg: 'bg-[#f4f1ea]',
        selectedFont: 'font-serif',
        gradientHeading: 'bg-gradient-to-b from-[#e2ddcf] to-[#f4f1ea]',
        accentText: 'text-[#424c3e]',
        subheadingColor: 'text-[#586453]',
        titleText: 'text-[#424c3e]',
        quoteText: 'text-[#586453]',
        cardBg: 'bg-white/85 border border-[#d1c9b6] rounded-2xl shadow-sm',
        badge: 'bg-[#f7f5f0] border border-[#c0b49c] text-[#586453]',
        accentBg: 'bg-[#7c8d76]',
        primaryBtn: 'bg-[#7c8d76] hover:bg-[#687763] text-white rounded-full',
        borderAccent: 'border-[#7c8d76]',
        heartColor: 'text-[#7c8d76]'
      };
    } else if (cat.includes('minimal') || cat.includes('modern') || cat.includes('clean')) {
      return {
        bg: 'bg-[#fafafa]',
        selectedFont: 'font-sans',
        gradientHeading: 'bg-gradient-to-b from-gray-100 to-[#fafafa]',
        accentText: 'text-gray-900',
        subheadingColor: 'text-gray-550',
        titleText: 'text-gray-950 font-normal tracking-tight uppercase',
        quoteText: 'text-gray-650',
        cardBg: 'bg-white border border-gray-200 rounded-none shadow-none',
        badge: 'bg-gray-100 border border-gray-300 text-gray-800 uppercase rounded-none',
        accentBg: 'bg-gray-950',
        primaryBtn: 'bg-gray-950 hover:bg-gray-800 text-white rounded-none',
        borderAccent: 'border-gray-950',
        heartColor: 'text-gray-950'
      };
    } else if (cat.includes('islamic') || cat.includes('islami')) {
      return {
        bg: 'bg-[#f5f9f6]',
        selectedFont: 'font-serif',
        gradientHeading: 'bg-gradient-to-b from-[#d4e6d9] to-[#f5f9f6]',
        accentText: 'text-[#1e4620]',
        subheadingColor: 'text-[#2e6031]',
        titleText: 'text-[#1e4620]',
        quoteText: 'text-[#1e4620]',
        cardBg: 'bg-white/95 border border-[#1e4620]/20 rounded-2xl shadow-md',
        badge: 'bg-[#edf5f0] border border-[#bcd4c2] text-[#1e4620]',
        accentBg: 'bg-[#1e4620]',
        primaryBtn: 'bg-[#1e4620] hover:bg-[#143016] text-white rounded-full',
        borderAccent: 'border-[#1e4620]',
        heartColor: 'text-[#1e4620]'
      };
    } else if (cat.includes('floral') || cat.includes('mawar') || cat.includes('flower')) {
      return {
        bg: 'bg-[#fdf8f7]',
        selectedFont: 'font-serif',
        gradientHeading: 'bg-gradient-to-b from-[#fbdcd4] to-[#fdf8f7]',
        accentText: 'text-[#be5a52]',
        subheadingColor: 'text-[#a64841]',
        titleText: 'text-[#be5a52]',
        quoteText: 'text-[#a64841]',
        cardBg: 'bg-white/80 border border-[#f2ccc0] rounded-2xl shadow-sm',
        badge: 'bg-[#fdead4] border border-[#fbccc0] text-[#be5a52]',
        accentBg: 'bg-[#be5a52]',
        primaryBtn: 'bg-[#be5a52] hover:bg-[#9a423b] text-white rounded-full',
        borderAccent: 'border-[#be5a52]',
        heartColor: 'text-[#be5a52]'
      };
    } else {
      // Classic
      return {
        bg: 'bg-[#fcfbf9]',
        selectedFont: 'font-serif',
        gradientHeading: 'bg-gradient-to-b from-rose-50/70 to-[#fcfbf9]',
        accentText: 'text-[#be185d]',
        subheadingColor: 'text-stone-500',
        titleText: 'text-[#be185d]',
        quoteText: 'text-stone-600',
        cardBg: 'bg-white rounded-3xl border border-rose-150 shadow-sm',
        badge: 'bg-pink-50 border border-pink-150 text-primary-700 rounded-full',
        accentBg: 'bg-primary-600',
        primaryBtn: 'bg-primary-600 hover:bg-primary-700 text-white rounded-full',
        borderAccent: 'border-rose-150',
        heartColor: 'text-pink-500'
      };
    }
  };

  // Standard Spinner UI fallback when querying database on first load
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <Heart className="w-12 h-12 text-pink-500 animate-pulse mb-3" />
        <p className="text-stone-500 text-sm font-medium">Buka lembaran undangan digital...</p>
      </div>
    );
  }

  // Error block UI if invitation was not found of database failure
  if (errorText || !invitation) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-3">Undangan Tidak Ditemukan</h2>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">{errorText || 'Halaman tidak dapat diakses.'}</p>
        <a 
          href="/"
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  // Expiration validation block (DO NOT block in sandbox preview mode so designers/customers can preview!)
  const isPreviewMode = !!templateSlug || window.location.pathname.startsWith('/preview');
  const isExpired = invitation?.expired_at && new Date(invitation.expired_at) < new Date();
  
  if (!isPreviewMode && isExpired) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-sans">
        {/* Background decorative glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px]" />
        
        <div className="relative max-w-md border border-white/10 bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center animate-in scale-in duration-300">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 mb-6 border border-rose-500/20">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Masa Tayang Undangan Selesai</h2>
          <p className="text-stone-400 text-xs leading-relaxed mb-8">
            Mohon maaf, masa aktif penayangan undangan digital untuk pasangan <strong>{invitation.groom_name} & {invitation.bride_name}</strong> telah kedaluwarsa.
          </p>
          
          <div className="text-[10px] text-stone-500 font-mono tracking-wider bg-black/20 px-4 py-2 rounded-full border border-white/5">
            EXPIRED ON: {new Date(invitation.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Custom JSX template rendering path
  if (customJsxCode) {
    if (compileError) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto animate-in fade-in">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 mb-3">Error di Template Kustom</h2>
          <p className="text-stone-500 text-xs leading-relaxed mb-6 font-mono text-left bg-stone-100 p-4 rounded-xl overflow-x-auto w-full">{compileError}</p>
          <button 
            onClick={() => setCustomJsxCode(null)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md transition"
          >
            Gunakan Tampilan Standar
          </button>
        </div>
      );
    }

    if (!CustomComponent) {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
          <Heart className="w-12 h-12 text-pink-500 animate-pulse mb-3" />
          <p className="text-stone-500 text-sm font-medium">Merender desain template kustom...</p>
        </div>
      );
    }

    const CustomElement = CustomComponent;
    return (
      <SafeErrorBoundary
        fallback={(err) => {
          const activeSlug = templateSlug || invitationSlug || window.location.pathname.split('/').pop() || '';
          return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto animate-in fade-in">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-3">Error Runtime di Template</h2>
              <p className="text-stone-500 text-xs leading-relaxed mb-6 font-mono text-left bg-stone-100 p-4 rounded-xl overflow-x-auto w-full max-h-60">
                {err.message || 'Error saat merender komponen.'}
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs px-5 py-3 rounded-full shadow-sm transition"
                >
                  Muat Ulang Halaman
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem(`draft_template_${activeSlug}`);
                    window.location.reload();
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-3 rounded-full shadow-md transition"
                >
                  Reset & Tampilan Standar
                </button>
              </div>
            </div>
          );
        }}
      >
        <CustomElement 
          mempelai={invitation}
          events={events}
          gifts={gifts}
          gallery={gallery}
          wishes={wishes}
          guest={guest}
        />
      </SafeErrorBoundary>
    );
  }

  const theme = getThemeStyles(templateCategory);

  // Render Full Screen Cover Overlay if invitation is not yet opened
  if (!isOpen) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between text-center overflow-hidden bg-gradient-to-b from-stone-100 via-rose-50/50 to-stone-100 p-8 ${theme.selectedFont}`}>
        
        {/* Top Decorative Vector Accent */}
        <div className={`w-32 h-32 opacity-20 border-t border-r ${theme.borderAccent || 'border-pink-400'} rounded-tr-full mt-4 flex items-center justify-center`}>
          <Heart className={`w-4 h-4 rotate-12 ${theme.heartColor}`} />
        </div>

        {/* Marriage Couple Headings */}
        <div className="my-auto space-y-6 max-w-xl">
          <span className={`text-xs uppercase tracking-widest font-semibold ${theme.subheadingColor}`}>Wedding Invitation</span>
          
          <h1 className={`text-4xl md:text-5xl font-bold leading-tight select-none ${theme.titleText}`}>
            {invitation.groom_name} & {invitation.bride_name}
          </h1>

          {/* Personalized Guest Box */}
          <div className={`${theme.cardBg} backdrop-blur-sm p-6 max-w-sm mx-auto space-y-3`}>
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h3 className={`text-lg font-bold leading-snug ${theme.accentText}`}>
              {guest ? guest.name : 'Tamu Undangan'}
            </h3>
            <span className="text-[10px] text-stone-400 inline-block font-medium">
              *Mohon maaf bila ada kesalahan penulisan nama/gelar.
            </span>
          </div>

          <p className="text-xs text-stone-500 font-medium px-4">
            Kami sangat menanti kehadiran Anda di hari bahagia pernikahan kami yang istimewa ini.
          </p>

          <div className="pt-4">
            <button
              onClick={handleOpenInvitation}
              className={`${theme.primaryBtn} active:scale-95 font-bold text-sm px-8 py-3.5 shadow-xl transition-all duration-200 inline-flex items-center gap-2`}
            >
              <MailOpen className="w-4 h-4" /> Buka Undangan
            </button>
          </div>
        </div>

        {/* Bottom Decorative Vector Accent */}
        <div className={`w-32 h-32 opacity-20 border-b border-l ${theme.borderAccent || 'border-pink-400'} rounded-bl-full mb-4 flex items-center justify-center`}>
          <Heart className={`w-4 h-4 -rotate-12 ${theme.heartColor}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${theme.bg} text-stone-800 selection:bg-pink-100 selection:text-pink-900 pb-20 ${theme.selectedFont}`}>
      
      {/* Dynamic Background Audio Player Floating Toggle */}
      {invitation.music_url && (
        <button
          onClick={togglePlayMusic}
          className="fixed bottom-6 right-6 z-40 bg-white/90 hover:bg-white text-stone-700 p-3 rounded-full shadow-xl border border-rose-100 transition active:scale-90 flex items-center justify-center"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <Volume2 className={`w-5 h-5 animate-bounce ${theme.heartColor}`} />
          ) : (
            <VolumeX className="w-5 h-5 text-stone-400" />
          )}
        </button>
      )}

      {/* 1. Hero / Header Panel (Initial landing layout) */}
      <section className={`relative min-h-[90vh] flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b ${theme.gradientHeading} border-b ${theme.borderAccent || 'border-rose-100/50'} justify-center`}>
        <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom duration-1000">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 border text-xs font-bold tracking-wide ${theme.badge}`}>
            <Heart className={`w-3.5 h-3.5 fill-current ${theme.heartColor}`} /> Walimatul 'Urs
          </div>
          
          <p className={`text-xs uppercase tracking-widest font-semibold ${theme.subheadingColor}`}>The Wedding of</p>
          
          <h1 className={`text-5xl md:text-6xl font-semibold leading-tight ${theme.titleText}`}>
            {invitation.groom_name} & {invitation.bride_name}
          </h1>

          {/* 2. Nama Tamu Personal */}
          <div className="bg-white/65 p-4 rounded-xl max-w-xs mx-auto border border-rose-100 shadow-sm text-center">
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-extrabold block mb-1">Penerima Undangan</span>
            <p className={`text-sm font-bold text-stone-800 leading-snug ${theme.selectedFont}`}>
              Kepada Yth. <span className="text-secondary-600 block sm:inline">{guest ? guest.name : 'Tamu Undangan'}</span>
            </p>
          </div>

          {/* 4. Tanggal Acara */}
          {events.length > 0 && (
            <div className="space-y-1.5 pt-4">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Akan diselenggarakan pada</p>
              <p className={`text-base font-semibold text-stone-800 ${theme.selectedFont}`}>
                {formatIndonesianDate(events[0].date)}
              </p>
            </div>
          )}
          
          {/* Scroll Down Arrow Indicator */}
          <div className="pt-8 flex flex-col items-center gap-1 text-stone-400 animate-bounce">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Scroll Kebawah</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* 6. Kutipan / Doa Section */}
      {invitation.quote && (
        <section className="max-w-3xl mx-auto px-6 py-16 text-center space-y-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-primary-500">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <p className={`text-stone-600 italic font-medium leading-relaxed text-sm md:text-base max-w-2xl mx-auto ${theme.selectedFont}`}>
            "{invitation.quote}"
          </p>
          <div className="w-12 h-[1px] bg-stone-250 mx-auto"></div>
        </section>
      )}

      {/* 5. Countdown Section */}
      {events.length > 0 && (
        <section className="bg-stone-50/55 py-12 border-y border-stone-200/40">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
            <h3 className={`text-xs uppercase tracking-widest font-extrabold ${theme.accentText}`}>Hitung Mundur Acara Bahagia</h3>
            
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-4 border border-rose-100/60 shadow-sm flex flex-col items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${theme.selectedFont} ${theme.accentText}`}>{timeLeft.days}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Hari</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-100/60 shadow-sm flex flex-col items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${theme.selectedFont} ${theme.accentText}`}>{timeLeft.hours}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Jam</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-100/60 shadow-sm flex flex-col items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${theme.selectedFont} ${theme.accentText}`}>{timeLeft.minutes}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Menit</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-100/60 shadow-sm flex flex-col items-center justify-center">
                <span className={`text-2xl md:text-3xl font-bold ${theme.selectedFont} ${theme.accentText}`}>{timeLeft.seconds}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Detik</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Nama Mempelai & 7. Profil Mempelai */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-3">
          <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Pasangan Mempelai</h2>
          <p className="text-stone-500 text-xs">Atas izin Allah SWT kami melangsungkan tali pernikahan kami yang suci.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Groom Block */}
          <div className="text-center space-y-4">
            <div className={`w-32 h-32 rounded-full border-2 bg-stone-100 flex items-center justify-center text-4xl font-bold text-stone-400 mx-auto overflow-hidden shadow-md ${theme.borderAccent || 'border-pink-100'} ${theme.selectedFont}`}>
              {gallery.find(img => img.caption === 'groom_photo')?.url || invitation.thumbnail_url ? (
                <img src={gallery.find(img => img.caption === 'groom_photo')?.url || invitation.thumbnail_url} alt={invitation.groom_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                invitation.groom_name.charAt(0)
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className={`text-2xl font-bold text-stone-800 ${theme.selectedFont}`}>{invitation.groom_name}</h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Mempelai Pria</p>
            </div>

            {invitation.groom_parent && (
              <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
                Putra tercinta dari:<br/>
                <span className="font-semibold text-stone-700">{invitation.groom_parent}</span>
              </p>
            )}
          </div>

          {/* Bride Block */}
          <div className="text-center space-y-4">
            <div className={`w-32 h-32 rounded-full border-2 bg-stone-100 flex items-center justify-center text-4xl font-bold text-stone-400 mx-auto overflow-hidden shadow-md ${theme.borderAccent || 'border-pink-100'} ${theme.selectedFont}`}>
              {gallery.find(img => img.caption === 'bride_photo')?.url || invitation.thumbnail_url ? (
                <img src={gallery.find(img => img.caption === 'bride_photo')?.url || invitation.thumbnail_url} alt={invitation.bride_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                invitation.bride_name.charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <h3 className={`text-2xl font-bold text-stone-800 ${theme.selectedFont}`}>{invitation.bride_name}</h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Mempelai Wanita</p>
            </div>

            {invitation.bride_parent && (
              <p className="text-stone-500 text-xs leading-relaxed max-w-sm mx-auto">
                Putri tercinta dari:<br/>
                <span className="font-semibold text-stone-700">{invitation.bride_parent}</span>
              </p>
            )}
          </div>

        </div>
      </section>

      {/* 8. Detail Akad dan Resepsi & 9. Tombol Google Maps */}
      {events.length > 0 && (
        <section className="bg-stone-50/30 border-y border-stone-200/30 py-20">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            
            <div className="text-center space-y-3">
              <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Agenda & Lokasi Acara</h2>
              <p className="text-stone-500 text-xs">Jadwal pelaksanaan akad penikahan dan resepsi keluarga.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
              {events.map((evt) => (
                <div key={evt.id} className={`p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 ${theme.cardBg}`}>
                  
                  <div className="space-y-4">
                    <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 ${theme.badge}`}>
                      {evt.type === 'akad' ? '💍 Akad Nikah' : '🎉 Resepsi Pernikahan'}
                    </span>

                    <h3 className={`text-xl font-bold text-stone-800 ${theme.selectedFont}`}>{evt.title}</h3>

                    <div className="space-y-2.5 text-stone-600 text-xs font-medium">
                      <div className="flex items-start gap-2">
                        <Calendar className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme.heartColor}`} />
                        <div>
                          <p className="font-bold text-stone-800">Hari & Tanggal</p>
                          <p>{formatIndonesianDate(evt.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme.heartColor}`} />
                        <div>
                          <p className="font-bold text-stone-800">Waktu / Pukul</p>
                          <p>{evt.start_time} - {evt.end_time || 'Selesai'} WIB</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme.heartColor}`} />
                        <div>
                          <p className="font-bold text-stone-800">Tempat</p>
                          <p className="font-medium">{evt.location_name}</p>
                          <p className="text-stone-500 leading-normal mt-1">{evt.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {evt.google_maps_url && (
                    <div className="pt-2">
                      <a
                        href={evt.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-bold text-xs px-5 py-3 transition flex items-center justify-center gap-2 shadow-md w-full ${theme.primaryBtn}`}
                      >
                        <Map className="w-4 h-4" /> Petunjuk Google Maps
                      </a>
                    </div>
                  )}

                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 10. Love story */}
      {invitation.love_story && (
        <section className="max-w-3xl mx-auto px-6 py-20 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Tali Kasih Kami</h2>
            <p className="text-stone-500 text-xs">Lembaran kisah cinta manis kami dari awal hingga bersatu pelaminan.</p>
          </div>

          <div className={`p-8 space-y-6 max-w-2xl mx-auto leading-relaxed text-sm text-stone-600 whitespace-pre-line ${theme.cardBg}`}>
            <p className={`italic text-center text-stone-500 ${theme.selectedFont}`}>"Kisah cinta sejati bukanlah akhir menceritakan pelaminan, melainkan babak baru perjuangan suci."</p>
            <div className="w-8 h-[1px] bg-stone-200 mx-auto my-2"></div>
            {invitation.love_story}
          </div>

        </section>
      )}

      {/* 11. Galeri foto */}
      {gallery.length > 0 && (
        <section className="bg-stone-50/10 py-20 border-y border-stone-200/20">
          <div className="max-w-5xl mx-auto px-6 space-y-12">
            
            <div className="text-center space-y-3">
              <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Galeri Bahagia</h2>
              <p className="text-stone-500 text-xs">Momen-momen indah masa pra-pernikahan digital kami.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.filter(item => item.caption !== 'groom_photo' && item.caption !== 'bride_photo').map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-rose-100 shadow-sm hover:scale-[1.02] transition duration-300">
                  <img
                    src={item.url}
                    alt={item.caption || 'Prewedding Photo'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* No caption overlay shown on standard grid */}
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 12. RSVP Form Area */}
      {/* 12. RSVP Form Area */}
      <section className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Konfirmasi Kehadiran</h2>
          <p className="text-stone-500 text-xs font-medium">Bantu kami mencatat pemenuhan kuota hidangan dengan mengisi formulir RSVP berikut.</p>
        </div>

        <div className={`p-8 shadow-md max-w-xl mx-auto ${theme.cardBg}`}>
          {rsvpSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-800">Terima Kasih Banyak!</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Konfirmasi RSVP Anda berhasil tersimpan. Doa restu Anda sangat berarti bagi kami berdua.
              </p>
              <button
                type="button"
                onClick={() => setRsvpSuccess(false)}
                className="text-primary-600 hover:text-primary-700 font-bold text-xs"
              >
                Kirim Konfirmasi Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-widest mb-1.5">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  disabled={!!guest}
                  placeholder="Isi nama santun Anda..."
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2.5 text-xs rounded-xl border transition-all ${
                    guest 
                      ? 'bg-stone-100 border-stone-250 text-stone-500 cursor-not-allowed font-medium' 
                      : 'border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-stone-800'
                  }`}
                />
                {guest && (
                  <span className="text-[10px] text-pink-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-pink-500" /> Tautan personal aktif. Nama Anda telah terkunci untuk konfirmasi ini.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-widest mb-1.5">Konfirmasi Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRsvpForm(prev => ({ ...prev, attendance: 'attending' }))}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      rsvpForm.attendance === 'attending' 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    😇 Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpForm(prev => ({ ...prev, attendance: 'declined' }))}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      rsvpForm.attendance === 'declined' 
                        ? 'bg-red-50 border-red-400 text-red-700' 
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    😔 Absen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpForm(prev => ({ ...prev, attendance: 'uncertain' }))}
                    className={`py-3 px-2 rounded-xl text-xs font-bold text-center border transition ${
                      rsvpForm.attendance === 'uncertain' 
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700' 
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    🤔 Ragu-ragu
                  </button>
                </div>
              </div>

              {rsvpForm.attendance === 'attending' && (
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-widest mb-1.5">Jumlah Tamu Hadir</label>
                  <select
                    value={rsvpForm.totalGuests}
                    onChange={(e) => setRsvpForm(prev => ({ ...prev, totalGuests: e.target.value }))}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-stone-700 font-semibold"
                  >
                    <option value="1">1 Orang (Hanya Anda)</option>
                    <option value="2">2 Orang (Membawa Pasangan)</option>
                    <option value="3">3 Orang (Membawa Keluarga)</option>
                    <option value="4">4 Orang (Membawa Keluarga Besar)</option>
                    <option value="5">5 Orang (Maksimal)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-widest mb-1.5">Doa & Ucapan Selamat</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan ucapan pernikahan yang tulus atau doa bahagia Anda di sini..."
                  value={rsvpForm.message}
                  onChange={(e) => setRsvpForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-stone-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={rsvpSubmitting}
                  className={`font-bold text-xs py-3.5 px-6 transition flex items-center justify-center gap-2 shadow-md w-full ${theme.primaryBtn}`}
                >
                  {rsvpSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim RSVP Kehadiran'}
                </button>
              </div>

            </form>
          )}
        </div>
      </section>

      {/* 13. Ucapan tamu / Guest wishes */}
      <section className="bg-stone-50/20 border-y border-stone-200/30 py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>Buku Tamu Doa Bahagia</h2>
            <p className="text-stone-500 text-xs">Ungkapan kasih sayang dan ucapan doa selamat dari teman & keluarga.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 max-w-4xl mx-auto items-start">
            
            {/* Quick Post Box */}
            <div className={`md:col-span-2 p-6 space-y-4 ${theme.cardBg}`}>
              <span className={`text-[10px] font-extrabold tracking-widest uppercase block border-b pb-2 ${theme.accentText}`}>Tinggalkan Ucapan Cepat</span>
              
              <form onSubmit={handleWishWallSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    disabled={!!guest}
                    placeholder="Nama Anda..."
                    value={wishForm.name}
                    onChange={(e) => setWishForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border transition-all ${
                      guest 
                        ? 'bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed font-medium' 
                        : 'border-stone-250 focus:outline-none focus:ring-2 focus:ring-primary-500 text-stone-850'
                    }`}
                  />
                  {guest && (
                    <span className="text-[9px] text-pink-600 font-semibold mt-1 block">
                      🔒 Nama terkunci otomatis sesuai daftar tamu customer.
                    </span>
                  )}
                </div>
                <div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tulis ucapan restu..."
                    value={wishForm.message}
                    onChange={(e) => setWishForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-250 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={wishSubmitting}
                  className={`font-bold text-xs py-2 px-4 transition shadow-sm w-full flex items-center justify-center gap-1.5 ${theme.primaryBtn}`}
                >
                  {wishSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3" /> Posting Ucapan</>}
                </button>
              </form>
            </div>

            {/* Scrollable feed list */}
            <div className="md:col-span-3 space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {wishes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center text-stone-400 text-xs font-semibold">
                  Belum ada ucapan pernikahan. Jadilah yang pertama memberikan doa restu!
                </div>
              ) : (
                wishes.map((wish) => (
                  <div key={wish.id} className={`p-4 space-y-1.5 transition ${theme.cardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-stone-800 text-xs ${theme.selectedFont}`}>{wish.guest_name}</span>
                      <span className="text-[9px] text-stone-400 font-mono">
                        {new Date(wish.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-stone-600 text-xs leading-normal font-medium whitespace-pre-line">
                      {wish.message}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 14. Wedding gift */}
      {gifts.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className={`text-3xl font-semibold ${theme.selectedFont} ${theme.titleText}`}>E-Gift & Amplop Digital</h2>
            <p className="text-stone-500 text-xs">Tanpa mengurangi rasa hormat, Anda dapat menyalurkan kasih kasih kado penikahan melalui tautan amplop digital di bawah ini.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {gifts.map((item) => {
              const isCopied = copiedGiftId === item.id;
              return (
                <div key={item.id} className={`p-6 text-center flex flex-col justify-between space-y-4 transition duration-300 ${theme.cardBg}`}>
                  <div className="space-y-2">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-stone-50 ${theme.heartColor}`}>
                      <Gift className="w-5 h-5" />
                    </span>

                    <h4 className="text-sm font-extrabold text-stone-700 tracking-wider font-mono uppercase bg-stone-50 py-1 rounded-lg">
                      {item.type === 'Bank' ? `🏧 BANK ${item.bank_name}` : item.type === 'E-Wallet' ? `📱 ${item.ewallet_name}` : '📦 KIRIM KADO'}
                    </h4>

                    {item.type !== 'Kirim Kado' ? (
                      <div className="space-y-1 pt-1">
                        <p className="text-stone-900 font-bold font-mono text-base tracking-wider selection:bg-stone-100">{item.account_number}</p>
                        <p className="text-stone-500 text-[11px] font-bold">a.n {item.account_name}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 pt-1 text-xs text-stone-600 leading-normal font-medium">
                        <p className="font-bold text-stone-800">Alamat Pengiriman:</p>
                        <p>{item.address}</p>
                      </div>
                    )}
                  </div>

                  {item.type !== 'Kirim Kado' && item.account_number && (
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(item.account_number, item.id)}
                      className={`px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 w-full shadow-sm ${theme.primaryBtn}`}
                    >
                      {isCopied ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin Rekening</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </section>
      )}



      {/* 16. Footer */}
      <footer className="border-t border-rose-100 text-center py-20 bg-stone-50/50">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <Heart className={`w-8 h-8 mx-auto fill-current ${theme.heartColor}`} />
          
          <div className="space-y-2">
            <p className={`text-stone-600 leading-relaxed text-sm ${theme.selectedFont}`}>
              "Merupakan suatu kebahagiaan dan kehormatan yang sangat besar bagi kami, apabila Bapak/Buku/Saudara/i berkenan hadir serta memberikan doa restu bagi kebersaman hidup kami."
            </p>
            <p className={`text-stone-500 font-bold text-xs ${theme.selectedFont}`}>
              Mempelai Pasangan:<br/>
              <span className={`font-bold text-base mt-2 inline-block font-sans ${theme.accentText}`}>{invitation.groom_name} & {invitation.bride_name}</span>
            </p>
          </div>

          <div className="pt-6 border-t border-stone-200/50">
            <span className="text-[10px] text-stone-400 font-extrabold tracking-widest uppercase">
              Powered by <a href="#" className="text-primary-500 hover:underline">NikahYuk!.id</a>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
