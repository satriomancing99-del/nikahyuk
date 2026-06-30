import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Upload, ArrowDownToLine, Smartphone, ExternalLink, Lock } from 'lucide-react';
import { useGuests } from './hooks/useGuests';
import { Guest } from '../../../types/database.types';
import { supabase } from '../../../lib/supabase';
import { GuestsFilterRow } from './components/GuestsFilterRow';
import { GuestsTable } from './components/GuestsTable';
import { GuestWhatsAppGenerator } from './components/GuestWhatsAppGenerator';
import { GuestAddModal } from './components/GuestAddModal';
import { GuestEditModal } from './components/GuestEditModal';
import { GuestImportModal } from './components/GuestImportModal';

export default function GuestsManager() {
  const {
    invitations,
    selectedInvitation,
    guests,
    setGuests,
    loading,
    actionLoading,
    invitationTier,
    handleSelectInvitation,
    handleAddGuest,
    handleUpdateGuest,
    handleDeleteGuest,
    setActionLoading,
  } = useGuests();

  const [activeTab, setActiveTab] = useState<'list' | 'whatsapp'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentStatus, setFilterSentStatus] = useState('all');
  const [filterRsvpStatus, setFilterRsvpStatus] = useState('all');
  const [filterCheckinStatus, setFilterCheckinStatus] = useState('all');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [selectedPreviewGuest, setSelectedPreviewGuest] = useState<Guest | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const buildInvitationMessage = (guest: Guest) => {
    const groom = selectedInvitation?.groom_name || 'Mempelai Pria';
    const bride = selectedInvitation?.bride_name || 'Mempelai Wanita';
    return `Yth. ${guest.name}\n\nAssalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon Rahmat dan Ridho Allah SWT, tanpa mengurangi rasa hormat melalui pesan ini kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:\n\n${groom} & ${bride}\n\nBerikut link undangan kami, untuk info lengkap dari acara bisa kunjungi:\n${guest.personal_link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.\n\nMohon maaf perihal undangan hanya dibagikan melalui pesan ini.\n\nTerima kasih banyak atas perhatiannya.\nWassalamualaikum Warahmatullahi Wabarakatuh\n\nHormat kami,\n${groom} & ${bride}`;
  };

  const handleCopyMessage = (guest: Guest) => {
    navigator.clipboard.writeText(buildInvitationMessage(guest));
    setCopiedMessageId(guest.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleCopyPersonalLink = (guest: Guest) => {
    navigator.clipboard.writeText(guest.personal_link);
    setCopiedLinkId(guest.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleCopyLink = (link: string, code: string) => {
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResetAllSentStatus = async () => {
    if (!selectedInvitation) return;
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang STATUS KIRIM semua tamu di undangan ini menjadi 'Belum Kirim'?")) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('guests')
        .update({ sent_status: 'unsent' })
        .eq('invitation_id', selectedInvitation.id);
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

  const handleExportCSV = () => {
    if (guests.length === 0) {
      alert('Tidak ada data tamu untuk diekspor.');
      return;
    }
    const headers = ['Nama Tamu', 'No WhatsApp', 'Guest Code', 'Link Undangan Personal', 'Status Kirim', 'RSVP', 'Status Checkin'];
    const rows = guests.map(g => [g.name, g.phone, g.guest_code, g.personal_link, g.sent_status || 'unsent', g.rsvp_status || 'pending', g.checkin_status || 'pending']);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_tamu_${selectedInvitation?.slug || 'nikahyuk'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenWhatsApp = async (guest: Guest) => {
    if (!guest.phone) {
      alert('Nomor HP tamu ini belum diisi atau tidak valid.');
      return;
    }
    const waUrl = `https://wa.me/${guest.phone}?text=${encodeURIComponent(buildInvitationMessage(guest))}`;
    if (guest.sent_status !== 'sent') {
      try {
        await supabase.from('guests').update({ sent_status: 'sent' }).eq('id', guest.id);
        setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, sent_status: 'sent' } : g));
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
    window.open(waUrl, '_blank');
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Tamu Undangan</h1>
          <p className="text-gray-500 text-sm">Kelola daftar penerima undangan, perbarui status kirim, RSVP, dan check-in barcode gratis.</p>
        </div>
        {selectedInvitation && (
          <div className="flex flex-wrap items-center gap-2">
            {invitationTier === 'platinum' ? (
              <button onClick={() => setShowImportModal(true)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm">
                <Upload className="w-4 h-4" /> Import Excel/CSV/VCF
              </button>
            ) : (
              <button type="button" onClick={() => alert("Fitur Impor Massal VCF/CSV hanya tersedia untuk Paket Platinum.")} className="bg-gray-50 border border-gray-200 text-gray-400 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-not-allowed">
                <Lock className="w-4 h-4 text-gray-400" /> Import Excel/CSV/VCF
              </button>
            )}
            <button onClick={handleExportCSV} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm">
              <ArrowDownToLine className="w-4 h-4" /> Export Excel
            </button>
            <button onClick={() => setShowAddModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md">
              <Plus className="w-4 h-4" /> Tambah Tamu
            </button>
          </div>
        )}
      </div>

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
              <select value={selectedInvitation?.id || ''} onChange={(e) => handleSelectInvitation(e.target.value)} className="text-sm font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer">
                {invitations.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.groom_name} & {inv.bride_name} ({inv.slug})</option>
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
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider select-none ${invitationTier === 'platinum' ? 'bg-amber-50 text-amber-700 border border-amber-100' : invitationTier === 'gold' ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-slate-100 text-slate-655 border border-slate-200'}`}>
                  {invitationTier === 'platinum' ? '✨ Platinum' : invitationTier === 'gold' ? '👑 Gold' : '🤍 Silver'}
                </span>
              </p>
            </div>
            <a href={`https://nikahyuk.id/${selectedInvitation.slug}`} target="_blank" rel="noreferrer" className="bg-white hover:bg-gray-100 p-2 rounded-lg border text-gray-500 hover:text-primary-600 transition" title="Kunjungi Undangan">
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
          <p className="text-gray-550 text-sm mb-6 leading-relaxed">Anda harus mempublikasikan setidaknya 1 undangan pernikahan digital terlebih dahulu sebelum mengelola daftar tamu.</p>
          <Link to="/dashboard/invitations/create" className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-md">Mulai Buat Undangan</Link>
        </div>
      )}

      {selectedInvitation && (
        <div className="space-y-6">
          <div className="flex border-b border-gray-200 bg-white px-5 pt-3 rounded-2xl shadow-sm">
            <button type="button" onClick={() => setActiveTab('list')} className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'list' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Users className="w-4 h-4" /> Daftar Tamu
            </button>
            <button type="button" onClick={() => { setActiveTab('whatsapp'); if (filteredGuests.length > 0 && !selectedPreviewGuest) { setSelectedPreviewGuest(filteredGuests[0]); } }} className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 relative ${activeTab === 'whatsapp' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Smartphone className="w-4 h-4" /> Generator WhatsApp Manual
              <span className="bg-green-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">PRO</span>
            </button>
          </div>

          {activeTab === 'list' ? (
            <>
              <GuestsFilterRow searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterSentStatus={filterSentStatus} setFilterSentStatus={setFilterSentStatus} filterRsvpStatus={filterRsvpStatus} setFilterRsvpStatus={setFilterRsvpStatus} filterCheckinStatus={filterCheckinStatus} setFilterCheckinStatus={setFilterCheckinStatus} />
              <GuestsTable guests={filteredGuests} loading={loading} actionLoading={actionLoading} copiedCode={copiedCode} copiedMessageId={copiedMessageId} copiedLinkId={copiedLinkId} handleOpenWhatsApp={handleOpenWhatsApp} handleCopyMessage={handleCopyMessage} handleCopyLink={handleCopyLink} openEditModal={openEditModal} handleDeleteGuest={handleDeleteGuest} />
            </>
          ) : (
            <GuestWhatsAppGenerator searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredGuests={filteredGuests} selectedPreviewGuest={selectedPreviewGuest} setSelectedPreviewGuest={setSelectedPreviewGuest} handleResetAllSentStatus={handleResetAllSentStatus} buildInvitationMessage={buildInvitationMessage} handleCopyPersonalLink={handleCopyPersonalLink} handleCopyMessage={handleCopyMessage} handleOpenWhatsApp={handleOpenWhatsApp} copiedMessageId={copiedMessageId} copiedLinkId={copiedLinkId} />
          )}
        </div>
      )}

      <GuestAddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddGuest} actionLoading={actionLoading} />
      <GuestEditModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} guest={editingGuest} onSubmit={handleUpdateGuest} actionLoading={actionLoading} />
      <GuestImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} selectedInvitation={selectedInvitation} invitationTier={invitationTier} guests={guests} setGuests={setGuests} actionLoading={actionLoading} setActionLoading={setActionLoading} />
    </div>
  );
}
