import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Guest, Invitation } from '../../../../types/database.types';
import { useGuestImport } from '../hooks/useGuestImport';

interface GuestImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvitation: Invitation | null;
  invitationTier: 'silver' | 'gold' | 'platinum';
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  actionLoading: boolean;
  setActionLoading: (loading: boolean) => void;
}

export const GuestImportModal: React.FC<GuestImportModalProps> = ({
  isOpen,
  onClose,
  selectedInvitation,
  invitationTier,
  guests,
  setGuests,
  actionLoading,
  setActionLoading,
}) => {
  const {
    csvText,
    setCsvText,
    importResults,
    importLogs,
    fileInputRef,
    handleFileChange,
    parseAndPrepareImport,
    handleExecuteImport,
  } = useGuestImport(
    selectedInvitation,
    invitationTier,
    guests,
    setGuests,
    setActionLoading,
    actionLoading,
    (show) => {
      if (!show) onClose();
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-extrabold text-gray-900 border-b pb-3 mb-4">
          Import Daftar Tamu (Excel / CSV / VCF)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Unggah file berformat <b>.csv</b>, <b>.vcf (kontak HP)</b>, atau tempel baris data teks secara langsung. Nama dan nomor WhatsApp tamu akan terdeteksi otomatis.
            </p>

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
            onClick={onClose}
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
  );
};
