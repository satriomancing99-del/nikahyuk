import React, { RefObject } from 'react';
import { QrCode, Loader2, ArrowRight } from 'lucide-react';

interface ScannerConsoleProps {
  scanInputRef: RefObject<HTMLInputElement>;
  guestCodeInput: string;
  setGuestCodeInput: (val: string) => void;
  submitting: boolean;
  handleFormSubmit: (e: React.FormEvent) => void;
}

export function ScannerConsole({
  scanInputRef,
  guestCodeInput,
  setGuestCodeInput,
  submitting,
  handleFormSubmit
}: ScannerConsoleProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-3xl overflow-hidden relative">
      <div className="bg-gray-900 p-4 text-white flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-extrabold flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> Laser Barcode Active
        </span>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
          Continuous Focus
        </span>
      </div>

      <div className="bg-gray-950 aspect-video relative flex flex-col items-center justify-center p-8 overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient opacity-10" />
        
        {/* Horizontal Neon scanning laser line */}
        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-[bounce_3s_infinite]" />

        {/* Simulated bracket borders */}
        <div className="w-48 h-28 border-2 border-dashed border-gray-600 rounded-xl relative flex flex-col items-center justify-center bg-gray-900/35 z-10">
          <QrCode className="w-12 h-12 text-gray-500" />
          <p className="text-[9px] text-gray-400 mt-2 font-bold tracking-widest uppercase">Pindai Barcode</p>
        </div>

        <div className="absolute bottom-3 text-center z-10 w-full px-6">
          <p className="text-[10px] text-gray-400 font-medium">
            Arahkan scanner genggam Anda, atau ketikkan kode tamu manual di bawah.
          </p>
        </div>
      </div>

      {/* Form Input Box */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Input Kode Tamu / Hasil Scan
            </label>
            <div className="relative">
              <input
                ref={scanInputRef}
                type="text"
                required
                placeholder="Masukkan 6 digit Kode Tamu (cth: AB73FC)..."
                value={guestCodeInput}
                onChange={(e) => setGuestCodeInput(e.target.value.toUpperCase())}
                disabled={submitting}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-extrabold uppercase tracking-widest bg-white"
              />
              <button
                type="submit"
                disabled={submitting || !guestCodeInput.trim()}
                className="absolute right-1.5 top-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
