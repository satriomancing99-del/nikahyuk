import React from 'react';
import { Loader2, QrCode, Volume2 } from 'lucide-react';
import { useCheckIn } from './hooks/useCheckIn';
import { ScannerConsole } from './components/ScannerConsole';
import { CheckInFeedbackCard } from './components/CheckInFeedbackCard';
import { LiveCheckInLogs } from './components/LiveCheckInLogs';
import { GuestSearchTable } from './components/GuestSearchTable';

export default function CheckIn() {
  const {
    invitations,
    selectedInvitation,
    recentCheckedIn,
    loading,
    submitting,
    guestCodeInput,
    setGuestCodeInput,
    scanInputRef,
    searchQuery,
    setSearchQuery,
    filterRsvp,
    setFilterRsvp,
    filterCheckin,
    setFilterCheckin,
    soundEnabled,
    setSoundEnabled,
    feedback,
    executeCheckIn,
    handleFormSubmit,
    filteredGuests,
    handleSelectInvitation
  } = useCheckIn();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner & Invitation Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-primary-600" /> QR Check-In Desk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pindai QR Code atau verifikasi kode personal tamu untuk kehadiran undangan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {invitations.length > 0 ? (
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Undangan Aktif</label>
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => handleSelectInvitation(e.target.value)}
                className="bg-gray-50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    💍 {inv.groom_name} & {inv.bride_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              Belum ada undangan dibuat
            </p>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl border transition flex items-center justify-center ${
              soundEnabled ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Menyiapkan konsol gatekeeper pernikahan...</p>
        </div>
      ) : !selectedInvitation ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Belum Ada Undangan Digital</h3>
          <p className="text-gray-500 text-xs">
            Harap buat undangan digital terlebih dahulu di menu "Undangan" sebelum mengelola registrasi barcode check-in meja tamu.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Scanning Command Center (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <ScannerConsole
              scanInputRef={scanInputRef}
              guestCodeInput={guestCodeInput}
              setGuestCodeInput={setGuestCodeInput}
              submitting={submitting}
              handleFormSubmit={handleFormSubmit}
            />

            <CheckInFeedbackCard feedback={feedback} />

            <div className="bg-[#fcfbf9] border border-dashed border-gray-200 p-6 rounded-3xl">
              <span className="text-[10px] font-extrabold text-primary-600 tracking-wider uppercase block mb-1">Gatekeeper Tips:</span>
              <p className="text-[11px] text-gray-500 leading-normal">
                Gunakan scanner barcode tipe keyboard-emulation USB/Bluetooth. Tempatkan kursor fokus di kolom input Kode Tamu. Saat scanner beroperasi, data check-in otomatis disubmit secara real-time.
              </p>
            </div>
          </div>

          {/* RIGHT: Directory list and Logs Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <LiveCheckInLogs recentCheckedIn={recentCheckedIn} />

            <GuestSearchTable
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterRsvp={filterRsvp}
              setFilterRsvp={setFilterRsvp}
              filterCheckin={filterCheckin}
              setFilterCheckin={setFilterCheckin}
              filteredGuests={filteredGuests}
              submitting={submitting}
              executeCheckIn={executeCheckIn}
            />
          </div>

        </div>
      )}

    </div>
  );
}
