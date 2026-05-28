import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, Plus, Upload, Trash2, Edit2, Copy, Check, ExternalLink, 
  Search, Filter, ArrowDownToLine, Loader2, Share2, Phone, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, Smartphone, HelpCircle,
  Clock, LogIn, ChevronLeft, MapPin, Lock
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService, guestService } from '../../services';
import { Invitation, Guest } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

// Helper to normalize WhatsApp phone number
export function normalizeWhatsApp(phone: string): string {
  // Hapus spasi, tanda minus, kurung, dan karakter selain angka atau tanda tambah
  let clean = phone.trim().replace(/[\s\-()]/g, '');
  
  if (clean.startsWith('+62')) {
    clean = '62' + clean.slice(3);
  } else if (clean.startsWith('08')) {
    clean = '628' + clean.slice(2);
  } else if (clean.startsWith('+08')) {
    clean = '628' + clean.slice(3);
  }
  
  // Clean all remaining non-number characters
  clean = clean.replace(/[^0-9]/g, '');
  return clean;
}

// Generate random Alphanumeric Guest Code of 6 lengths
function generateGuestCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Guests() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [activeTab, setActiveTab ] = useState<'list' | 'whatsapp'>('list');
  const [selectedPreviewGuest, setSelectedPreviewGuest] = useState<Guest | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [invitationTier, setInvitationTier] = useState<'silver' | 'gold' | 'platinum'>('silver');

  const buildInvitationMessage = (guest: Guest) => {
    const groom = selectedInvitation?.groom_name || 'Mempelai Pria';
    const bride = selectedInvitation?.bride_name || 'Mempelai Wanita';
    return `Yth. ${guest.name}

Assalamualaikum Warahmatullahi Wabarakatuh

Dengan memohon Rahmat dan Ridho Allah SWT, tanpa mengurangi rasa hormat melalui pesan ini kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

${groom} & ${bride}

Berikut link undangan kami, untuk info lengkap dari acara bisa kunjungi:
${guest.personal_link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.

Terima kasih banyak atas perhatiannya.
Wassalamualaikum Warahmatullahi Wabarakatuh

Hormat kami,
${groom} & ${bride}`;
  };

  const handleCopyMessage = (guest: Guest) => {
    const text = buildInvitationMessage(guest);
    navigator.clipboard.writeText(text);
    setCopiedMessageId(guest.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleCopyPersonalLink = (guest: Guest) => {
    navigator.clipboard.writeText(guest.personal_link);
    setCopiedLinkId(guest.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleResetAllSentStatus = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang STATUS KIRIM semua tamu di undangan ini menjadi 'Belum Kirim'?")) {
      return;
    }
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('guests')
        .update({ sent_status: 'unsent' })
        .eq('invitation_id', selectedInvitation!.id);
      if (error) throw error;
      setGuests(prev => prev.map(g => ({ ...g, sent_status: 'unsent' })));
      alert("Berhasil meriset semua status kirim tamu.");
    } catch (err: any) {
      console.error(err);
      alert("Gagal meriset status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentStatus, setFilterSentStatus] = useState('all');
  const [filterRsvpStatus, setFilterRsvpStatus] = useState('all');
  const [filterCheckinStatus, setFilterCheckinStatus] = useState('all');

  // Modals visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add / Edit Form State
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    sent_status: 'unsent',
    rsvp_status: 'pending',
    checkin_status: 'pending'
  });
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // Import file/text state
  const [csvText, setCsvText] = useState('');
  const [importResults, setImportResults] = useState<Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed'; error?: string }>>([]);
  const [importLogs, setImportLogs] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Invitations on start
  useEffect(() => {
    async function loadInvitations() {
      if (!user) return;
      try {
        setLoading(true);
        const list = profile?.role === 'super_admin'
          ? await invitationService.getAll()
          : await invitationService.getByUserId(user.id);
        setInvitations(list);

        // Determine which invitation to pick
        const queryId = searchParams.get('invitation');
        if (queryId) {
          const found = list.find(inv => inv.id === queryId);
          if (found) {
            setSelectedInvitation(found);
            return;
          }
        }

        // Default pick first if found
        if (list.length > 0) {
          setSelectedInvitation(list[0]);
          // Sync URL search parameter
          setSearchParams({ invitation: list[0].id });
        }
      } catch (err) {
        console.error('Error fetching invitations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user]);

  // Load Guests and active package tier when selected invitation changes
  useEffect(() => {
    if (!selectedInvitation) {
      setGuests([]);
      return;
    }
    
    async function loadGuestsAndTier() {
      try {
        setLoading(true);
        // Load guests
        const list = await guestService.getByInvitationId(selectedInvitation!.id);
        setGuests(list);

        // Load active template price to resolve package tier
        let price = 0;
        try {
          const { data: templateData, error: templateErr } = await supabase
            .from('templates')
            .select('price')
            .eq('id', selectedInvitation!.template_id)
            .single();
          
          if (!templateErr && templateData) {
            price = Number(templateData.price);
          }
        } catch (err) {
          console.error('Error loading template price:', err);
        }

        // Determine package tier
        let tier: 'silver' | 'gold' | 'platinum' = 'silver';
        if (price === 99000) tier = 'gold';
        else if (price === 149000) tier = 'platinum';
        setInvitationTier(tier);

      } catch (err) {
        console.error('Error loading guests & tier info:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGuestsAndTier();
  }, [selectedInvitation]);

  const handleSelectInvitation = (id: string) => {
    const found = invitations.find(i => i.id === id);
    if (found) {
      setSelectedInvitation(found);
      setSearchParams({ invitation: id });
      setSelectedPreviewGuest(null);
    }
  };

  // Helper to copy links
  const handleCopyLink = (link: string, code: string) => {
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Manual Add Guest
  const handleAddGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvitation || !user) return;

    if (!guestForm.name.trim()) {
      alert('Nama tamu wajib diisi.');
      return;
    }

    // Quota check
    const maxGuests = invitationTier === 'silver' ? 150 : invitationTier === 'gold' ? 500 : Infinity;
    if (guests.length >= maxGuests) {
      alert(`Batas kuota tamu tercapai! Batas maksimal tamu untuk undangan Paket ${invitationTier.toUpperCase()} adalah ${maxGuests} tamu. Silakan upgrade paket Anda untuk menambah lebih banyak tamu.`);
      return;
    }

    try {
      setActionLoading(true);
      
      const normalized = normalizeWhatsApp(guestForm.phone);
      if (guestForm.phone && !normalized) {
        alert('Nomor HP tidak valid. Pastikan hanya memasukkan angka.');
        setActionLoading(false);
        return;
      }

      // Generate unique code (check against loaded guests)
      const existingCodes = new Set(guests.map(g => g.guest_code));
      let guestCode = generateGuestCode();
      while (existingCodes.has(guestCode)) {
        guestCode = generateGuestCode();
      }

      // Format personal link
      const personalLink = `https://nikahyuk.id/${selectedInvitation.slug}?guest=${guestCode}`;

      const newGuest = await guestService.create({
        invitation_id: selectedInvitation.id,
        name: guestForm.name.trim(),
        phone: normalized,
        guest_code: guestCode,
        personal_link: personalLink,
        qr_code_value: guestCode,
        sent_status: guestForm.sent_status,
        rsvp_status: guestForm.rsvp_status,
        checkin_status: guestForm.checkin_status
      });

      setGuests(prev => [...prev, newGuest]);
      setShowAddModal(false);
      setGuestForm({
        name: '',
        phone: '',
        sent_status: 'unsent',
        rsvp_status: 'pending',
        checkin_status: 'pending'
      });
      alert('Tamu berhasil ditambahkan.');
    } catch (err: any) {
      console.error('Error creating guest:', err);
      alert(`Gagal menambah tamu: ${err.message || 'Kesalahan Server'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setGuestForm({
      name: guest.name,
      phone: guest.phone,
      sent_status: guest.sent_status || 'unsent',
      rsvp_status: guest.rsvp_status || 'pending',
      checkin_status: guest.checkin_status || 'pending'
    });
    setShowEditModal(true);
  };

  // Edit Submit
  const handleEditGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuestId || !selectedInvitation) return;

    if (!guestForm.name.trim()) {
      alert('Nama tamu tidak boleh kosong.');
      return;
    }

    try {
      setActionLoading(true);
      const normalized = normalizeWhatsApp(guestForm.phone);
      
      const updated = await guestService.update(editingGuestId, {
        name: guestForm.name.trim(),
        phone: normalized,
        sent_status: guestForm.sent_status,
        rsvp_status: guestForm.rsvp_status,
        checkin_status: guestForm.checkin_status
      });

      setGuests(prev => prev.map(g => g.id === editingGuestId ? updated : g));
      setShowEditModal(false);
      setEditingGuestId(null);
      alert('Informasi tamu berhasil diperbarui.');
    } catch (err: any) {
      console.error('Error updating guest:', err);
      alert(`Gagal menyunting tamu: ${err.message || 'Kesalahan server'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (id: string, name: string) => {
    if (!window.confirm(`Konfirmasi hapus tamu "${name}"? Tindakan ini permanen.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await guestService.delete(id);
      setGuests(prev => prev.filter(g => g.id !== id));
      alert('Tamu berhasil dihapus dari daftar.');
    } catch (err: any) {
      console.error('Error deleting guest:', err);
      alert(`Gagal menghapus: ${err.message || 'Kesalahan server'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Excel / CSV / VCF File Parsing Helper & Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVcf = file.name.toLowerCase().endsWith('.vcf');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        if (isVcf) {
          parseVCFAndPrepareImport(text);
        } else {
          setCsvText(text);
          parseAndPrepareImport(text);
        }
      }
    };
    reader.readAsText(file);
  };

  const parseVCFAndPrepareImport = (text: string) => {
    const vcards = text.split("BEGIN:VCARD");
    const parsed: Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed' }> = [];

    vcards.forEach((card) => {
      if (!card.trim()) return;

      const fnMatch = card.match(/FN:(.+)/);
      const telMatch = card.match(/TEL(?:;[^:]*)?:(.+)/);

      if (fnMatch) {
        const name = fnMatch[1].trim().replace(/^["']|["']$/g, '');
        let phone = telMatch ? telMatch[1].replace(/[^0-9+]/g, '').trim() : '';

        if (name && phone) {
          parsed.push({
            name,
            phone,
            status: 'pending'
          });
        }
      }
    });

    setImportResults(parsed);
    setCsvText(parsed.map(p => `${p.name},${p.phone}`).join('\n'));
    setImportLogs(`Terdeteksi ${parsed.length} kontak dari file .VCF siap di-import.`);
  };

  const parseAndPrepareImport = (text: string) => {
    // splits on line endings
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const parsed: Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed' }> = [];

    // Is there any header? Case-insensitive matching
    let startIndex = 0;
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase();
      // Check if first line contains keyword like name/phone/nama/no
      if (
        firstLine.includes('name') || 
        firstLine.includes('phone') || 
        firstLine.includes('nama') || 
        firstLine.includes('telp') || 
        firstLine.includes('wa') || 
        firstLine.includes('no')
      ) {
        startIndex = 1; // skip header line
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // support both comma and semicolon split
      const columns = line.split(/[,;]/);
      if (columns.length >= 2) {
        parsed.push({
          name: columns[0].trim().replace(/^["']|["']$/g, ''), // strip enclosing quotes
          phone: columns[1].trim().replace(/^["']|["']$/g, ''),
          status: 'pending'
        });
      } else if (columns.length === 1 && line.includes('\t')) {
        // Tab-separated fallback (e.g. copied from Excel sheets directly)
        const tabCols = line.split('\t');
        if (tabCols.length >= 2) {
          parsed.push({
            name: tabCols[0].trim(),
            phone: tabCols[1].trim(),
            status: 'pending'
          });
        }
      }
    }

    setImportResults(parsed);
    setImportLogs(`Terdeteksi ${parsed.length} baris data calon tamu siap di-import.`);
  };

  // Mass Import Action to Supabase
  const handleExecuteImport = async () => {
    if (!selectedInvitation || importResults.length === 0) return;

    // Quota check
    const maxGuests = invitationTier === 'silver' ? 150 : invitationTier === 'gold' ? 500 : Infinity;
    if (guests.length + importResults.length > maxGuests) {
      alert(`Gagal Impor! Jumlah tamu saat ini (${guests.length}) ditambah jumlah impor baru (${importResults.length}) melebihi kuota maksimal Paket ${invitationTier.toUpperCase()} (${maxGuests} Tamu). Silakan kurangi daftar tamu Anda atau upgrade paket.`);
      return;
    }

    try {
      setActionLoading(true);
      setImportLogs('Sedang mengimpor data tamu satu per satu...');
      
      const existingCodes = new Set(guests.map(g => g.guest_code));
      const successes: Guest[] = [];
      let successCount = 0;
      let failureCount = 0;

      // Import records in batch sequentially
      for (let i = 0; i < importResults.length; i++) {
        const item = importResults[i];
        try {
          const normalized = normalizeWhatsApp(item.phone);
          
          // Generate unique code
          let guestCode = generateGuestCode();
          while (existingCodes.has(guestCode)) {
            guestCode = generateGuestCode();
          }
          // mark as used
          existingCodes.add(guestCode);

          const personalLink = `https://nikahyuk.id/${selectedInvitation.slug}?guest=${guestCode}`;

          const payload = {
            invitation_id: selectedInvitation.id,
            name: item.name,
            phone: normalized,
            guest_code: guestCode,
            personal_link: personalLink,
            qr_code_value: guestCode,
            sent_status: 'unsent',
            rsvp_status: 'pending',
            checkin_status: 'pending'
          };

          const newGuest = await guestService.create(payload);
          successes.push(newGuest);
          importResults[i].status = 'success';
          successCount++;
        } catch (itemErr: any) {
          console.error(`Import failed for candidate row ${i}:`, itemErr);
          importResults[i].status = 'failed';
          importResults[i].error = itemErr.message || 'DB Error';
          failureCount++;
        }
      }

      setGuests(prev => [...prev, ...successes]);
      setImportLogs(`Selesai! Berhasil mengimpor ${successCount} tamu. Gagal: ${failureCount}.`);
      alert(`Proses import selesai. Berhasil: ${successCount}, Gagal: ${failureCount}`);
      
      if (failureCount === 0) {
        // Automatically close on 100% success
        setTimeout(() => {
          setShowImportModal(false);
          setCsvText('');
          setImportResults([]);
          setImportLogs(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Migration batch failure:', err);
      alert('Gagal menjalankan proses import.');
    } finally {
      setActionLoading(false);
    }
  };

  // Export to standard CSV
  const handleExportCSV = () => {
    if (guests.length === 0) {
      alert('Tidak ada data tamu untuk diekspor.');
      return;
    }

    const headers = ['Nama Tamu', 'No WhatsApp', 'Guest Code', 'Link Undangan Personal', 'Status Kirim', 'RSVP', 'Status Checkin'];
    const rows = guests.map(g => [
      g.name,
      g.phone,
      g.guest_code,
      g.personal_link,
      g.sent_status || 'unsent',
      g.rsvp_status || 'pending',
      g.checkin_status || 'pending'
    ]);

    // Create CSV content formatting
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_tamu_${selectedInvitation?.slug || 'nikahyuk'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send Invitation via WhatsApp Helper (Opens New Web Tab)
  const handleOpenWhatsApp = async (guest: Guest) => {
    if (!guest.phone) {
      alert('Nomor HP tamu ini belum diisi atau tidak valid.');
      return;
    }

    const messageText = buildInvitationMessage(guest);
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${guest.phone}?text=${encodedText}`;
    
    // Automatically update status to 'sent' when clicked to optimize flow!
    if (guest.sent_status !== 'sent') {
      try {
        await guestService.update(guest.id, { sent_status: 'sent' });
        setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, sent_status: 'sent' } : g));
      } catch (err) {
        console.error('Error updating status after WA click:', err);
      }
    }

    window.open(waUrl, '_blank');
  };

  // Filter & Search Logic
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.phone.includes(searchQuery) ||
                          g.guest_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSent = filterSentStatus === 'all' || g.sent_status === filterSentStatus;
    const matchesRsvp = filterRsvpStatus === 'all' || g.rsvp_status === filterRsvpStatus;
    const matchesCheckin = filterCheckinStatus === 'all' || g.checkin_status === filterCheckinStatus;

    return matchesSearch && matchesSent && matchesRsvp && matchesCheckin;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Tamu Undangan</h1>
          <p className="text-gray-500 text-sm">Kelola daftar penerima undangan, perbarui status kirim, RSVP, dan check-in barcode gratis.</p>
        </div>

        {/* Action buttons */}
        {selectedInvitation && (
          <div className="flex flex-wrap items-center gap-2">
            {invitationTier === 'platinum' ? (
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-4 h-4" /> Import Excel/CSV/VCF
              </button>
            ) : (
              <button
                type="button"
                onClick={() => alert("Fitur Impor Massal VCF/CSV hanya tersedia untuk Paket Platinum. Silakan upgrade paket Anda untuk menggunakan asisten impor.")}
                className="bg-gray-50 border border-gray-200 text-gray-400 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-not-allowed"
              >
                <Lock className="w-4 h-4 text-gray-400" /> Import Excel/CSV/VCF
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <ArrowDownToLine className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah Tamu
            </button>
          </div>
        )}
      </div>

      {/* Invitation Selector Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Edit Tamu Untuk Undangan Pasangan</label>
            {invitations.length === 0 ? (
              <p className="text-sm font-bold text-gray-700">Belum ada undangan yang dibuat</p>
            ) : (
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => handleSelectInvitation(e.target.value)}
                className="text-sm font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer"
              >
                {invitations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.groom_name} & {inv.bride_name} ({inv.slug})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedInvitation && (
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-150">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-bold">Total Tamu Terdaftar</p>
              <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
                <span>{guests.length} / {invitationTier === 'silver' ? '150' : invitationTier === 'gold' ? '500' : '∞'}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider select-none ${
                  invitationTier === 'platinum' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  invitationTier === 'gold' ? 'bg-primary-50 text-primary-700 border border-primary-100' :
                  'bg-slate-100 text-slate-655 border border-slate-200'
                }`}>
                  {invitationTier === 'platinum' ? '✨ Platinum' : invitationTier === 'gold' ? '👑 Gold' : '🤍 Silver'}
                </span>
              </p>
            </div>
            <a 
              href={`https://nikahyuk.id/${selectedInvitation.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white hover:bg-gray-100 p-2 rounded-lg border text-gray-500 hover:text-primary-600 transition"
              title="Kunjungi Undangan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {invitations.length === 0 && !loading && (
        <div className="bg-white border rounded-3xl p-16 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Buat Undangan Dulu</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Anda harus mempublikasikan setidaknya 1 undangan pernikahan digital terlebih dahulu sebelum mengelola daftar tamu.
          </p>
          <Link 
            to="/dashboard/invitations/create"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-md"
          >
            Mulai Buat Undangan
          </Link>
        </div>
      )}

      {selectedInvitation && (
        <div className="space-y-6">
          {/* Tabs Navigation Switcher */}
          <div className="flex border-b border-gray-200 bg-white px-5 pt-3 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Users className="w-4 h-4" /> Daftar Tamu
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('whatsapp');
                if (filteredGuests.length > 0 && !selectedPreviewGuest) {
                  setSelectedPreviewGuest(filteredGuests[0]);
                }
              }}
              className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 relative ${
                activeTab === 'whatsapp'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Generator WhatsApp Manual
              <span className="bg-green-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                PRO
              </span>
            </button>
          </div>

          {activeTab === 'list' ? (
            <>
              {/* Filters & Control Grid */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama, WhatsApp, atau kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800"
                  />
                </div>

                {/* Filter Status Kirim */}
                <div>
                  <select
                    value={filterSentStatus}
                    onChange={(e) => setFilterSentStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                  >
                    <option value="all">Semua Status Kirim</option>
                    <option value="unsent">Belum Dikirim</option>
                    <option value="sent">Sudah Dikirim</option>
                  </select>
                </div>

                {/* Filter RSVP */}
                <div>
                  <select
                    value={filterRsvpStatus}
                    onChange={(e) => setFilterRsvpStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                  >
                    <option value="all">Semua RSVP</option>
                    <option value="pending font-semibold">Menunggu Konfirmasi</option>
                    <option value="attending">Hadir</option>
                    <option value="declined">Tidak Hadir</option>
                  </select>
                </div>

                {/* Filter Check-in */}
                <div>
                  <select
                    value={filterCheckinStatus}
                    onChange={(e) => setFilterCheckinStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                  >
                    <option value="all">Semua Check-in</option>
                    <option value="pending">Pending</option>
                    <option value="checked_in">Sudah Check-in</option>
                  </select>
                </div>

              </div>

              {/* Table Container */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-16 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">Memuat database tamu undangan...</p>
                  </div>
                ) : filteredGuests.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-medium">
                    <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Tidak ada data tamu yang cocok dengan pencarian / filter Anda.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Nama Tamu</th>
                          <th className="px-6 py-4">No WhatsApp</th>
                          <th className="px-6 py-4">Guest Code</th>
                          <th className="px-6 py-4">Status Kirim</th>
                          <th className="px-6 py-4">Status Buka</th>
                          <th className="px-6 py-4">Status RSVP</th>
                          <th className="px-6 py-4">Check-in Status</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
                        {filteredGuests.map((guest) => {
                          const isCopied = copiedCode === guest.guest_code;
                          const isMessageCopied = copiedMessageId === guest.id;
                          return (
                            <tr key={guest.id} className="hover:bg-gray-50/50 transition">
                              
                              {/* Nama */}
                              <td className="px-6 py-4 font-bold text-gray-900">
                                {guest.name}
                              </td>
                              
                              {/* WhatsApp */}
                              <td className="px-6 py-4 text-gray-600 font-medium font-mono">
                                {guest.phone ? (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-green-500" /> +{guest.phone}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">Kosong</span>
                                )}
                              </td>
                              
                              {/* Guest Code */}
                              <td className="px-6 py-4 font-mono font-bold text-gray-800">
                                {guest.guest_code}
                              </td>

                              {/* Status Kirim */}
                              <td className="px-6 py-4">
                                {guest.sent_status === 'sent' ? (
                                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                    <CheckCircle className="w-3 h-3" /> Terkirim
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                    <Clock className="w-3 h-3" /> Belum Kirim
                                  </span>
                                )}
                              </td>

                              {/* Status Buka */}
                              <td className="px-6 py-4">
                                {guest.opened_at ? (
                                  <span className="text-xs text-green-600 font-bold" title={new Date(guest.opened_at).toLocaleString()}>
                                    Dibuka
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Belum dibuka</span>
                                )}
                              </td>

                              {/* Status RSVP */}
                              <td className="px-6 py-4">
                                {guest.rsvp_status === 'attending' && (
                                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                    Hadir
                                  </span>
                                )}
                                {guest.rsvp_status === 'declined' && (
                                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                    Tidak Hadir
                                  </span>
                                )}
                                {(!guest.rsvp_status || guest.rsvp_status === 'pending') && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[10px] font-bold">
                                    Pending
                                  </span>
                                )}
                              </td>

                              {/* Status Check-in */}
                              <td className="px-6 py-4">
                                {guest.checkin_status === 'checked_in' ? (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                    <LogIn className="w-3 h-3" /> Berhasil
                                  </span>
                                ) : (
                                  <span className="text-gray-400 font-medium">Pending</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Send Whatsapp */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenWhatsApp(guest)}
                                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition"
                                    title="Kirim Undangan WhatsApp"
                                  >
                                    <Smartphone className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Copy Message */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyMessage(guest)}
                                    className="text-gray-500 hover:text-primary-600 bg-gray-100 p-1.5 rounded-lg transition"
                                    title="Salin Pesan Undangan Lengkap"
                                  >
                                    {isMessageCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Copy Link */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(guest.personal_link, guest.guest_code)}
                                    className="text-gray-550 hover:text-primary-600 bg-gray-100 p-1.5 rounded-lg transition"
                                    title="Salin Personal Link"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Edit Guest */}
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(guest)}
                                    className="text-blue-500 hover:text-blue-600 bg-blue-50 p-1.5 rounded-lg transition"
                                    title="Edit Detail Tamu"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Guest */}
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                    className="text-red-500 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition"
                                    title="Hapus Tamu"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Generator WhatsApp Workspace UI Panel */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              
              {/* Left Column: Guest selector panel with status (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col h-[650px]">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Pilih Penerima Undangan</h3>
                  <p className="text-xs text-gray-500">Pencarian cepat tamu untuk menyiapkan pesan WhatsApp.</p>
                </div>

                {/* Search Bar inside left column */}
                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama tamu HP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-805"
                  />
                </div>

                {/* Options and status controls row */}
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono">Hasil Filter ({filteredGuests.length})</span>
                  <button
                    onClick={handleResetAllSentStatus}
                    className="text-[10px] text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Semua Status
                  </button>
                </div>

                {/* List box container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredGuests.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400">
                      Tidak ada nama tamu ditemukan
                    </div>
                  ) : (
                    filteredGuests.map((guest) => {
                      const isSelected = selectedPreviewGuest?.id === guest.id;
                      return (
                        <button
                          key={guest.id}
                          type="button"
                          onClick={() => setSelectedPreviewGuest(guest)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                            isSelected 
                              ? 'bg-primary-50 border-primary-500 shadow-sm ring-1 ring-primary-400/20' 
                              : 'bg-white border-gray-150 hover:bg-gray-50'
                          }`}
                        >
                          <div className="truncate space-y-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{guest.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">+{guest.phone || 'Nomer Kosong'}</p>
                          </div>
                          {guest.sent_status === 'sent' ? (
                            <span className="bg-green-100 text-green-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-lg flex-shrink-0">
                              ✓ Terkirim
                            </span>
                          ) : (
                            <span className="bg-yellow-50 text-yellow-800 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-lg flex-shrink-0">
                              🕒 Antrean
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Live simulation chat and execution triggers (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-[650px] flex flex-col justify-between">
                {!selectedPreviewGuest ? (
                  <div className="m-auto text-center max-w-sm space-y-4 p-8">
                    <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mx-auto">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">Pratinjau Pesan Personal</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Silakan klik salah satu penerima di sebelah kiri untuk melihat render pesan kustomisasi instan, menyalin URL wa.me, dan mengirimkannya.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 flex flex-col justify-between overflow-hidden">
                    
                    {/* Top detail bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block">Menerima Undangan</span>
                        <h4 className="text-base font-bold text-gray-900 mt-0.5">{selectedPreviewGuest.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyPersonalLink(selectedPreviewGuest)}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1"
                        >
                          {copiedLinkId === selectedPreviewGuest.id ? (
                            <><Check className="w-3.5 h-3.5 text-green-600" /> Disalin</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5 text-gray-500" /> Salin Link</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(selectedPreviewGuest)}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1"
                        >
                          {copiedMessageId === selectedPreviewGuest.id ? (
                            <><Check className="w-3.5 h-3.5 text-green-600" /> Disalin</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5 text-gray-500" /> Salin Teks</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chat simulator container */}
                    <div className="flex-1 bg-[#efeae2] rounded-2xl border border-gray-150 p-4 relative overflow-y-auto flex flex-col justify-between min-h-[220px]">
                      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}></div>
                      
                      <div className="relative z-10 max-w-xl bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-150 text-xs font-semibold text-gray-800 whitespace-pre-line leading-relaxed self-start">
                        {buildInvitationMessage(selectedPreviewGuest)}
                      </div>

                      {/* Display of live wa.me link with quick actions */}
                      <div className="relative z-10 bg-white/95 backdrop-blur-md px-3.5 py-3 border border-gray-150 rounded-xl mt-4 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">URL wa.me Otomatis</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`https://wa.me/${selectedPreviewGuest.phone || ''}?text=${encodeURIComponent(buildInvitationMessage(selectedPreviewGuest))}`}
                            className="bg-gray-50 border border-gray-200 text-gray-650 selection:bg-primary-100 rounded-lg px-2 py-1 text-[10px] font-mono flex-1 outline-none text-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const urlToCopy = `https://wa.me/${selectedPreviewGuest.phone || ''}?text=${encodeURIComponent(buildInvitationMessage(selectedPreviewGuest))}`;
                              navigator.clipboard.writeText(urlToCopy);
                              alert('Tautan wa.me berhasil disalin!');
                            }}
                            className="bg-primary-50 hover:bg-primary-100 font-bold text-[10px] px-3 py-1 rounded-lg transition text-primary-700"
                          >
                            Salin URL
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer execution triggers */}
                    <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Kirim Secara Manual</p>
                        <p className="text-[10px] text-gray-400">Pesan akan dimuat otomatis saat WhatsApp Web atau aplikasi seluler terbuka.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(selectedPreviewGuest)}
                        className="bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-1.5 justify-center"
                      >
                        <Phone className="w-4 h-4" /> Buka WhatsApp & Kirim
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD SINGLE GUEST MANUALLY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Tambah Tamu Baru</h3>
            
            <form onSubmit={handleAddGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Tamu</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789 atau +628..."
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[10px] text-gray-400 font-medium block mt-1">
                  Nomor akan dinormalisasi otomatis ke format standar internasional (628...).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Kirim</label>
                  <select
                    value={guestForm.sent_status}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, sent_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="unsent">Belum Kirim</option>
                    <option value="sent">Sudah Kirim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status RSVP</label>
                  <select
                    value={guestForm.rsvp_status}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, rsvp_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Hadir</option>
                    <option value="declined">Tidak Hadir</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Tamu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT EXCEL / CSV / VCF GUESTS WITH AUTO GENERATIONS */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 border-b pb-3 mb-4">Import Daftar Tamu (Excel / CSV / VCF)</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Instructions and Upload */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Unggah file berformat <b>.csv</b>, <b>.vcf (kontak HP)</b>, atau tempel baris data teks secara langsung. Nama dan nomor WhatsApp tamu akan terdeteksi otomatis.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">Contoh Format Excel / CSV</span>
                  <pre className="text-[10px] font-mono text-gray-600 bg-white p-2.5 rounded-lg border leading-normal">
{`name,phone
Budi Santoso,08123456789
Siti Aminah,628987654321`}
                  </pre>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unggah berkas file (.csv / .txt / .vcf)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv, .txt, .vcf, text/plain"
                    onChange={handleFileChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Paste or parse visual results panel */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Atau Tempel Baris Raw Data di sini</label>
                  <textarea
                    rows={4}
                    placeholder={`Budi Santoso,08123456789\nSiti Aminah,628987654321`}
                    value={csvText}
                    onChange={(e) => {
                      setCsvText(e.target.value);
                      parseAndPrepareImport(e.target.value);
                    }}
                    className="w-full px-3 py-2.5 text-[10px] font-mono rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {importLogs && (
                  <div className="bg-primary-50 border border-primary-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-primary-800">
                    <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Analisis Impor:</span>
                      <p className="text-[11px] leading-normal font-medium mt-0.5">{importLogs}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Candidate list parsed scroll preview */}
            {importResults.length > 0 && (
              <div className="mt-6 border border-gray-150 rounded-2xl overflow-hidden max-h-[160px] overflow-y-auto bg-gray-50 p-2">
                <table className="w-full text-left text-[10px] font-mono leading-tight">
                  <thead>
                    <tr className="text-gray-400 border-b pb-1 font-bold">
                      <th className="py-1 px-2">Nama Penerima</th>
                      <th className="py-1 px-2">Nomor Telepon</th>
                      <th className="py-1 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-white/80">
                        <td className="py-1 px-2 text-gray-800 font-bold truncate max-w-[140px]">{item.name}</td>
                        <td className="py-1 px-2 text-gray-500">{item.phone}</td>
                        <td className="py-1 px-2 text-right">
                          {item.status === 'success' && <span className="text-green-600 font-bold font-sans">Sukses</span>}
                          {item.status === 'failed' && <span className="text-red-500 font-bold font-sans" title={item.error}>Gagal</span>}
                          {item.status === 'pending' && <span className="text-gray-400">Siap</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-5 border-t mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setCsvText('');
                  setImportResults([]);
                  setImportLogs(null);
                }}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={actionLoading || importResults.length === 0}
                onClick={handleExecuteImport}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Proses Import (${importResults.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CURRENT GUEST DETAILS */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Sunting Tamu Undangan</h3>
            
            <form onSubmit={handleEditGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812345..."
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[10px] text-gray-400 font-medium block mt-1">
                  Nomor akan dinormalisasi ke format standar internasional saat disimpan.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Kirim</label>
                  <select
                    value={guestForm.sent_status}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, sent_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
                  >
                    <option value="unsent">Belum Kirim</option>
                    <option value="sent">Sudah Kirim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status RSVP</label>
                  <select
                    value={guestForm.rsvp_status}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, rsvp_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Hadir</option>
                    <option value="declined">Tidak Hadir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Check-in</label>
                  <select
                    value={guestForm.checkin_status}
                    onChange={(e) => setGuestForm(prev => ({ ...prev, checkin_status: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="checked_in">Berhasil</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGuestId(null);
                  }}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
