import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TYPOGRAPHY_TEMPLATE_JSX = `// Template: Elegance Typique Minimalist (Pure Typographic Theme)
// Created with Love - 100% Compatible Sandboxing & Zero Images Required

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Calendar, MapPin, Clock, Volume2, VolumeX, MailOpen, Send, 
  CheckCircle, MessageCircle, Copy, Check, Navigation, Gift 
} from 'lucide-react';

const FALLBACK_AUDIO_URL = 'https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-ballad-1191.mp3';

const entrance = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatDate(value, fallback = 'Sabtu, 27 Mei 2026') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function eventDateValue(eventItem) {
  return eventItem?.date || eventItem?.datetime || eventItem?.start_time || eventItem?.start || eventItem?.event_date || '';
}

function eventTimeLabel(eventItem, fallback = '09:00 - 11:00 WIB') {
  const direct = eventItem?.time || eventItem?.hour || eventItem?.jam;
  if (direct) return direct;
  const start = eventItem?.start_time || eventItem?.start;
  const end = eventItem?.end_time || eventItem?.end;
  const fmt = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date).replace('.', ':');
  };
  const startLabel = fmt(start);
  const endLabel = fmt(end);
  if (startLabel && endLabel) return \`\${startLabel} - \targetLabel\${endLabel} WIB\`;
  if (startLabel) return \`\${startLabel} WIB\`;
  return fallback;
}

function eventPlaceLabel(eventItem, fallback = 'Grand Ballroom') {
  return eventItem?.venue || eventItem?.place || eventItem?.location_name || eventItem?.location || eventItem?.title || fallback;
}

function eventAddressLabel(eventItem, fallback = 'Jl. Melati Indah No. 27, Kota Bahagia') {
  return eventItem?.address || eventItem?.full_address || eventItem?.alamat || fallback;
}

function mapsUrl(eventItem) {
  return eventItem?.google_maps_url || eventItem?.maps_url || eventItem?.map_url || eventItem?.location_url || '#';
}

function getTimeLeft(target) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function getTargetDate(eventItem) {
  const raw = eventDateValue(eventItem);
  const parsed = raw ? new Date(raw) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 30);
  fallback.setHours(9, 0, 0, 0);
  return fallback;
}

export default function TypographicInvitation({ mempelai, events, gifts, gallery, wishes, guest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState('Hadir');
  const [rsvpSent, setRsvpSent] = useState(false);
  const [wishSent, setWishSent] = useState(false);
  const [localWishes, setLocalWishes] = useState([]);
  const [wishText, setWishText] = useState('');
  const [copiedGiftId, setCopiedGiftId] = useState(null);
  const audioRef = useRef(null);

  const groomName = mempelai?.groom_name || 'Aditya Pratama';
  const brideName = mempelai?.bride_name || 'Aulia Rahmawati';
  const groomParent = mempelai?.groom_parent || 'Bpk. Heri Pratama & Ibu Shinta';
  const brideParent = mempelai?.bride_parent || 'Bpk. Ahmad Rahmawan & Ibu Lestari';
  const quote = mempelai?.quote || 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.';
  const loveStory = mempelai?.love_story || '';
  const guestName = guest?.name || 'Tamu Terhormat';
  const isGuestLocked = Boolean(guest?.name);

  const eventList = safeArray(events);
  const akad = useMemo(() => eventList?.find((e) => e?.type === 'akad' || e?.title?.toLowerCase()?.includes('akad')) || eventList?.[0] || {}, [eventList]);
  const resepsi = useMemo(() => eventList?.find((e) => e?.type === 'resepsi' || e?.title?.toLowerCase()?.includes('resepsi')) || eventList?.[1] || {}, [eventList]);
  const targetDate = useMemo(() => getTargetDate(akad), [akad]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  const displayedWishes = useMemo(() => {
    const initial = safeArray(wishes)?.map((item, index) => ({
      name: item?.name || item?.guest_name || 'Sahabat',
      message: item?.message || item?.wish || item?.text || 'Selamat menempuh hidup baru. Semoga bahagia selalu.',
      id: item?.id || \`wish-\${index}\`
    }));
    return [...localWishes, ...initial];
  }, [wishes, localWishes]);

  const activeGifts = useMemo(() => {
    return safeArray(gifts)?.filter(g => {
      if (g.type === 'Bank' || g.type === 'E-Wallet') {
        return g.account_number?.trim() && g.account_name?.trim();
      }
      return g.address?.trim();
    }) || [];
  }, [gifts]);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const openInvitation = () => {
    setIsOpen(true);
    window.setTimeout(() => {
      if (audioRef?.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 200);
  };

  const toggleAudio = () => {
    if (!audioRef?.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const submitRsvp = (event) => {
    event.preventDefault();
    setRsvpSent(true);
  };

  const submitWish = (event) => {
    event.preventDefault();
    const cleanMessage = wishText.trim();
    if (!cleanMessage) return;
    setLocalWishes([{ name: guestName, message: cleanMessage, id: \`local-\${Date.now()}\` }]);
    setWishText('');
    setWishSent(true);
  };

  const handleCopyAccount = (number, id) => {
    navigator.clipboard.writeText(number);
    setCopiedGiftId(id);
    setTimeout(() => setCopiedGiftId(null), 2000);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf7] text-[#4d4637] font-serif leading-relaxed">
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-serif-lux { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-lux { font-family: 'Montserrat', sans-serif; }
      \`}</style>
      <audio ref={audioRef} src={mempelai?.music_url || FALLBACK_AUDIO_URL} loop preload="auto" />

      {/* COVER ENTRANCE OVERLAY */}
      <AnimatePresence>
        {!isOpen && (
          <motion.section
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#262420] text-[#e8e4dc] px-6 py-16 text-center"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Top Border */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#cfa87b] to-transparent" />

            <motion.div
              className="max-w-xl space-y-8"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <p className="font-sans-lux text-[10px] uppercase tracking-[0.4em] text-[#cfa87b]">Wedding Invitation</p>
              
              <div className="space-y-4">
                <h1 className="font-serif-lux text-5xl md:text-6xl font-light tracking-wide text-white italic">
                  {groomName}
                </h1>
                <p className="font-serif-lux text-2xl font-light text-[#cfa87b]">&</p>
                <h1 className="font-serif-lux text-5xl md:text-6xl font-light tracking-wide text-white italic">
                  {brideName}
                </h1>
              </div>

              <div className="py-8 px-6 border-y border-[#cfa87b]/20 max-w-sm mx-auto space-y-2">
                <p className="font-sans-lux text-[9px] uppercase tracking-[0.25em] text-[#b8b3a9]">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                <h3 className="font-serif-lux text-2xl font-medium text-white tracking-wide">{guestName}</h3>
              </div>

              <button
                type="button"
                onClick={openInvitation}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-[#cfa87b] hover:bg-[#cfa87b] hover:text-stone-900 px-8 py-3.5 font-sans-lux text-xs font-semibold uppercase tracking-[0.2em] text-[#cfa87b] transition duration-300 active:scale-95"
              >
                <MailOpen size={14} /> Buka Undangan
              </button>
            </motion.div>

            {/* Bottom Border */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#cfa87b] to-transparent" />
          </motion.section>
        )}
      </AnimatePresence>

      {/* FLOATING MUSIC CONTROLLER */}
      {isOpen && (
        <button
          type="button"
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8dccb] bg-white/90 text-[#8f7556] shadow-md backdrop-blur-md transition active:scale-90"
          aria-label="Audio controller"
        >
          {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <VolumeX size={18} />}
        </button>
      )}

      {/* HERO HEADER */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center p-8 bg-[#fdfdfc] border-b border-[#e8dccb]/50">
        <div className="absolute top-12 left-12 right-12 bottom-12 border border-[#e8dccb]/30 pointer-events-none rounded-[2rem]" />
        
        <motion.div {...entrance} className="max-w-2xl space-y-6">
          <p className="font-sans-lux text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8f7556]">Walimatul 'Urs</p>
          
          <h2 className="font-serif-lux text-6xl md:text-8xl font-light tracking-wide text-[#3b3529] leading-tight">
            {groomName} <span className="text-[#cfa87b] font-light font-sans-lux text-3xl md:text-5xl block md:inline my-2 md:my-0">&</span> {brideName}
          </h2>
          
          <div className="w-16 h-px bg-[#cfa87b] mx-auto my-6" />

          {events?.length > 0 && (
            <div className="space-y-1">
              <p className="font-sans-lux text-[9px] font-medium uppercase tracking-[0.2em] text-[#a09787]">Akan Diselenggarakan Pada</p>
              <p className="font-serif-lux text-xl font-medium text-[#4d4637]">
                {formatDate(eventDateValue(akad))}
              </p>
            </div>
          )}

          {/* COUNTDOWN TIMER */}
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto pt-6">
            {[
              ['Hari', timeLeft.days],
              ['Jam', timeLeft.hours],
              ['Menit', timeLeft.minutes],
              ['Detik', timeLeft.seconds]
            ].map(([label, value]) => (
              <div key={label} className="border border-[#e8dccb]/70 bg-white/50 rounded-xl p-3 text-center shadow-xs">
                <div className="font-serif-lux text-2xl font-semibold text-[#5c5446]">{String(value).padStart(2, '0')}</div>
                <div className="font-sans-lux text-[8px] uppercase tracking-wider text-[#a09787] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HOLY QUOTE */}
      {quote && (
        <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <div className="text-[#cfa87b] inline-block"><Heart size={20} className="fill-current" /></div>
          <p className="font-serif-lux text-lg md:text-xl italic font-light text-[#5c5446] leading-relaxed max-w-xl mx-auto">
            "{quote}"
          </p>
          <div className="w-12 h-px bg-[#cfa87b]/40 mx-auto pt-4" />
        </section>
      )}

      {/* PASANGAN MEMPELAI - PURE TYPOGRAPHY */}
      <section className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <motion.div {...entrance} className="text-center space-y-2">
          <p className="font-sans-lux text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8f7556]">Mempelai</p>
          <h2 className="font-serif-lux text-4xl font-light text-[#3b3529]">Pasangan Bahagia</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 max-w-4xl mx-auto divide-y md:divide-y-0 md:divide-x divide-[#e8dccb]/60">
          
          {/* Groom Editorial */}
          <motion.article {...entrance} className="text-center pt-8 md:pt-0 space-y-4">
            <div className="space-y-1">
              <span className="font-sans-lux text-[9px] uppercase tracking-widest text-[#a09787]">Mempelai Pria</span>
              <h3 className="font-serif-lux text-3xl font-medium text-[#3b3529]">{groomName}</h3>
            </div>
            
            <p className="font-serif-lux text-sm text-[#706859] leading-relaxed italic max-w-xs mx-auto">
              Putra terhormat dari:<br />
              <strong className="text-[#5c5446] not-italic text-base font-medium block mt-1">{groomParent}</strong>
            </p>
          </motion.article>

          {/* Bride Editorial */}
          <motion.article {...entrance} className="text-center pt-8 md:pt-0 md:pl-12 lg:pl-20 space-y-4">
            <div className="space-y-1">
              <span className="font-sans-lux text-[9px] uppercase tracking-widest text-[#a09787]">Mempelai Wanita</span>
              <h3 className="font-serif-lux text-3xl font-medium text-[#3b3529]">{brideName}</h3>
            </div>
            
            <p className="font-serif-lux text-sm text-[#706859] leading-relaxed italic max-w-xs mx-auto">
              Putri terhormat dari:<br />
              <strong className="text-[#5c5446] not-italic text-base font-medium block mt-1">{brideParent}</strong>
            </p>
          </motion.article>

        </div>
      </section>

      {/* LOVE STORY (If Available) */}
      {loveStory && (
        <section className="relative px-5 py-20 md:px-10">
          <div className="mx-auto max-w-3xl border border-[#e8dccb] bg-[#fdfdfb] p-8 md:p-12 rounded-[2rem] shadow-xs">
            <motion.div {...entrance} className="space-y-4">
              <p className="font-sans-lux text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8f7556]">Kisah Kami</p>
              <h2 className="font-serif-lux text-3xl font-light text-[#3b3529]">Tali Kasih</h2>
              <p className="font-sans-lux text-xs leading-relaxed text-[#706859] whitespace-pre-line">{loveStory}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* EVENTS & LOCATION */}
      {eventList?.length > 0 && (
        <section className="border-y border-[#e8dccb]/50 bg-[#faf9f5] py-20">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-2">
              <p className="font-sans-lux text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8f7556]">Agenda</p>
              <h2 className="font-serif-lux text-4xl font-light text-[#3b3529]">Rangkaian Acara</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                { title: 'Akad Nikah', data: akad },
                { title: 'Resepsi Pernikahan', data: resepsi }
              ].map((item) => (
                <motion.article key={item.title} {...entrance} className="bg-white border border-[#e8dccb] p-8 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
                  <div className="space-y-4">
                    <span className="inline-block border border-[#cfa87b] text-[#8f7556] font-sans-lux text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                      {item.title}
                    </span>
                    <h3 className="font-serif-lux text-2xl font-medium text-[#3b3529]">{item.data?.title || item.title}</h3>
                    
                    <div className="space-y-3 font-sans-lux text-xs text-[#706859]">
                      <p className="flex gap-2.5 items-start">
                        <Calendar size={14} className="mt-0.5 text-[#cfa87b] shrink-0" />
                        <span>{formatDate(eventDateValue(item.data))}</span>
                      </p>
                      <p className="flex gap-2.5 items-start">
                        <Clock size={14} className="mt-0.5 text-[#cfa87b] shrink-0" />
                        <span>{eventTimeLabel(item.data)}</span>
                      </p>
                      <p className="flex gap-2.5 items-start">
                        <MapPin size={14} className="mt-0.5 text-[#cfa87b] shrink-0" />
                        <span>
                          <strong className="text-[#3b3529] font-semibold block">{eventPlaceLabel(item.data)}</strong>
                          {eventAddressLabel(item.data)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {mapsUrl(item.data) !== '#' && (
                    <a 
                      href={mapsUrl(item.data)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#4a4336] hover:bg-[#363127] text-white px-5 py-3 font-sans-lux text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      <Navigation size={12} /> Rute Google Maps
                    </a>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP FORM & WISHES BOX */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
          
          {/* RSVP FORM */}
          <motion.form onSubmit={submitRsvp} {...entrance} className="border border-[#e8dccb] bg-white p-8 rounded-3xl space-y-5 shadow-xs">
            <span className="font-sans-lux text-[9px] uppercase tracking-widest text-[#a09787] block">RSVP</span>
            <h2 className="font-serif-lux text-3xl font-light text-[#3b3529]">Konfirmasi Kehadiran</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block font-sans-lux text-[9px] font-semibold uppercase tracking-wider text-[#706859] mb-1.5">Nama Lengkap Anda</label>
                <input
                  value={guestName}
                  readOnly={isGuestLocked}
                  disabled={isGuestLocked}
                  className={\`w-full rounded-xl border border-[#efd1ca] px-4 py-3 font-sans-lux text-xs outline-none \${isGuestLocked ? 'bg-[#f4f2ee] text-stone-400 cursor-not-allowed' : 'bg-white text-stone-800'}\`}
                />
              </div>

              <div>
                <label className="block font-sans-lux text-[9px] font-semibold uppercase tracking-wider text-[#706859] mb-1.5">Rencana Kehadiran</label>
                <select 
                  value={rsvpStatus} 
                  onChange={(e) => setRsvpStatus(e.target.value)} 
                  className="w-full rounded-xl border border-[#e8dccb] bg-white px-4 py-3 font-sans-lux text-xs text-stone-700 outline-none"
                >
                  <option>Hadir</option>
                  <option>Berhalangan</option>
                  <option>Masih Dipertimbangkan</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a4336] hover:bg-[#363127] text-white px-5 py-3.5 font-sans-lux text-[10px] font-bold uppercase tracking-wider transition"
              >
                <CheckCircle size={14} /> Kirim Konfirmasi
              </button>

              {rsvpSent && (
                <p className="rounded-xl bg-[#faf7f3] border border-[#e8dccb] px-4 py-3 font-sans-lux text-xs text-[#8f7556] text-center">
                  Terima kasih banyak. Respon RSVP Anda telah terekam.
                </p>
              )}
            </div>
          </motion.form>

          {/* WISHES & DOAR ESTU */}
          <motion.div {...entrance} className="border border-[#e8dccb] bg-white p-8 rounded-3xl space-y-6 shadow-xs">
            <span className="font-sans-lux text-[9px] uppercase tracking-widest text-[#a09787] block">Buku Tamu</span>
            <h2 className="font-serif-lux text-3xl font-light text-[#3b3529]">Doa & Ucapan Restu</h2>
            
            <form onSubmit={submitWish} className="grid gap-3">
              <textarea
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                rows={3}
                placeholder="Tulis ucapan selamat dan doa tulus Anda..."
                className="w-full resize-none rounded-xl border border-[#e8dccb] bg-white px-4 py-3 font-sans-lux text-xs text-stone-800 outline-none placeholder:text-stone-300"
              />
              <button 
                type="submit" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a4336] hover:bg-[#363127] text-white px-5 py-3.5 font-sans-lux text-[10px] font-bold uppercase tracking-wider transition"
              >
                <Send size={12} /> Kirim Ucapan
              </button>
              {wishSent && (
                <p className="rounded-xl bg-[#faf7f3] border border-[#e8dccb] px-4 py-3 font-sans-lux text-xs text-[#8f7556] text-center">
                  Doa restu Anda telah diposting di Buku Tamu. Terima kasih.
                </p>
              )}
            </form>

            <div className="max-h-56 space-y-3 overflow-y-auto pr-2">
              {displayedWishes?.map((item) => (
                <article key={item?.id} className="rounded-xl border border-[#e8dccb]/70 bg-[#faf9f6] p-4 text-left">
                  <p className="font-sans-lux text-[10px] font-bold text-[#5c5446]">{item?.name}</p>
                  <p className="mt-1 font-serif-lux text-xs text-[#706859] leading-relaxed whitespace-pre-line">{item?.message}</p>
                </article>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* WEDDING GIFT / DIGITAL ENVELOPE (Pure Typographic cards) */}
      {activeGifts?.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20 space-y-12">
          <div className="text-center space-y-2">
            <p className="font-sans-lux text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8f7556]">E-Gift</p>
            <h2 className="font-serif-lux text-4xl font-light text-[#3b3529]">Tanda Kasih</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {activeGifts.map((item) => {
              const isCopied = copiedGiftId === item.id;
              return (
                <div key={item.id} className="border border-[#e8dccb] bg-[#fafcfb] p-6 rounded-2xl text-center flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#e8dccb] text-[#cfa87b]">
                      <Gift size={14} />
                    </span>

                    <h4 className="font-sans-lux text-[9px] font-bold uppercase tracking-widest text-[#a09787]">
                      {item.type === 'Bank' ? \`🏧 BANK \${item.bank_name}\` : item.type === 'E-Wallet' ? \`📱 \${item.ewallet_name}\` : '📦 KIRIM KADO'}
                    </h4>

                    {item.type !== 'Kirim Kado' ? (
                      <div className="space-y-0.5 pt-1">
                        <p className="font-sans-lux text-sm font-semibold tracking-wider text-[#3b3529]">{item.account_number}</p>
                        <p className="font-serif-lux text-[11px] text-[#706859] italic">a.n {item.account_name}</p>
                      </div>
                    ) : (
                      <p className="font-serif-lux text-xs text-[#706859] leading-relaxed pt-1">{item.address}</p>
                    )}
                  </div>

                  {item.type !== 'Kirim Kado' && item.account_number && (
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(item.account_number, item.id)}
                      className="inline-flex items-center justify-center gap-1 w-full rounded-xl bg-[#4a4336] hover:bg-[#363127] text-white px-4 py-2 font-sans-lux text-[9px] font-semibold uppercase tracking-wider transition"
                    >
                      {isCopied ? <><Check size={10} /> Tersalin</> : <><Copy size={10} /> Salin Nomor</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#e8dccb]/50 bg-[#fafcfb] py-20 text-center">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <div className="text-[#cfa87b] inline-block"><Heart size={20} className="fill-current" /></div>
          
          <p className="font-serif-lux text-sm md:text-base italic font-light text-[#5c5446] leading-relaxed">
            "Merupakan suatu kebahagiaan dan kehormatan yang sangat besar bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu bagi kebersamaan hidup kami."
          </p>

          <p className="font-sans-lux text-[10px] uppercase tracking-[0.25em] text-[#a09787]">
            Kami Yang Berbahagia:<br />
            <strong className="text-[#3b3529] font-semibold text-sm block mt-2 font-serif-lux tracking-wide not-italic">{groomName} & {brideName}</strong>
          </p>

          <div className="pt-6 border-t border-[#e8dccb]/30">
            <span className="font-sans-lux text-[8px] font-bold tracking-[0.3em] uppercase text-[#a09787]">
              Powered by <a href="https://nikahyuk.com" className="text-[#cfa87b] hover:underline font-bold">NikahYuk!</a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
\`;

async function run() {
  console.log("Seeding purely typographic template 'elegance-typique'...");

  // Check if it already exists to prevent duplicate error
  const { data: existing, error: checkError } = await supabase
    .from('templates')
    .select('id')
    .eq('slug', 'elegance-typique')
    .maybeSingle();

  if (checkError) {
    console.error("Error checking database:", checkError);
    return;
  }

  const payload = {
    name: 'Elegance Typique Minimalist',
    slug: 'elegance-typique',
    category: 'Minimalist',
    price: 0, // Silver tier - Free for everyone!
    thumbnail_url: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=400',
    preview_url: '/preview/elegance-typique',
    status: 'active',
    jsx_code: TYPOGRAPHY_TEMPLATE_JSX
  };

  if (existing) {
    console.log("Template 'elegance-typique' already exists. Updating its content...");
    const { error: updateError } = await supabase
      .from('templates')
      .update(payload)
      .eq('id', existing.id);

    if (updateError) {
      console.error("Error updating template:", updateError);
    } else {
      console.log("Template updated successfully!");
    }
  } else {
    console.log("Inserting new template 'elegance-typique'...");
    const { error: insertError } = await supabase
      .from('templates')
      .insert(payload);

    if (insertError) {
      console.error("Error inserting template:", insertError);
    } else {
      console.log("Template inserted successfully!");
    }
  }
}

run();
