import React from 'react';
import { Search, RefreshCw, Smartphone, Copy, Check, Phone } from 'lucide-react';
import { Guest } from '../../../../types/database.types';

interface GuestWhatsAppGeneratorProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredGuests: Guest[];
  selectedPreviewGuest: Guest | null;
  setSelectedPreviewGuest: (guest: Guest | null) => void;
  handleResetAllSentStatus: () => void;
  buildInvitationMessage: (guest: Guest) => string;
  handleCopyPersonalLink: (guest: Guest) => void;
  handleCopyMessage: (guest: Guest) => void;
  handleOpenWhatsApp: (guest: Guest) => void;
  copiedMessageId: string | null;
  copiedLinkId: string | null;
}

export const GuestWhatsAppGenerator: React.FC<GuestWhatsAppGeneratorProps> = ({
  searchQuery,
  setSearchQuery,
  filteredGuests,
  selectedPreviewGuest,
  setSelectedPreviewGuest,
  handleResetAllSentStatus,
  buildInvitationMessage,
  handleCopyPersonalLink,
  handleCopyMessage,
  handleOpenWhatsApp,
  copiedMessageId,
  copiedLinkId,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Left Column: Guest selector panel with status (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col h-[650px]">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900">Pilih Penerima Undangan</h3>
          <p className="text-xs text-gray-500">Pencarian cepat tamu untuk menyiapkan pesan WhatsApp.</p>
        </div>

        {/* Search Bar inside left column */}
        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-405">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari nama tamu HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
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
                  className="bg-gray-50 hover:bg-gray-100 text-gray-705 border border-gray-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1"
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
                  className="bg-gray-50 hover:bg-gray-100 text-gray-705 border border-gray-200 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1"
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
              
              <div className="relative z-10 max-w-xl bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-150 text-xs font-semibold text-gray-805 whitespace-pre-line leading-relaxed self-start">
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
  );
};
