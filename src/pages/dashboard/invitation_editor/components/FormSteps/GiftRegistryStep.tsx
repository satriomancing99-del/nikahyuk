import React from 'react';
import { Gift, Trash2, Plus } from 'lucide-react';

interface GiftRegistryStepProps {
  activePackage: 'silver' | 'gold' | 'platinum';
  profile: any;
  giftsList: any[];
  setGiftsList: React.Dispatch<React.SetStateAction<any[]>>;
}

export const GiftRegistryStep: React.FC<GiftRegistryStepProps> = ({
  activePackage,
  profile,
  giftsList,
  setGiftsList,
}) => {
  const isSilver = activePackage === 'silver' && profile?.role !== 'super_admin';

  const handleAddGift = () => {
    setGiftsList(prev => [...prev, { type: 'Bank', bank_name: 'BCA', account_number: '', account_name: '', ewallet_name: '', address: '' }]);
  };

  const handleRemoveGift = (index: number) => {
    setGiftsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    setGiftsList(prev => prev.map((gift, i) => i === index ? { ...gift, [field]: value } : gift));
  };

  if (isSilver) {
    return (
      <div className="bg-amber-50 border border-amber-205 rounded-2xl p-8 text-center space-y-3">
        <Gift className="w-12 h-12 text-amber-500 mx-auto" />
        <h4 className="font-bold text-amber-805">Fitur Kado Digital Terkunci</h4>
        <p className="text-xs text-amber-600 max-w-md mx-auto leading-relaxed">
          Fitur E-Gift, Transfer Rekening, dan Kado Fisik hanya tersedia untuk kustomer paket <strong>Gold & Platinum</strong>. Silakan upgrade paket Anda untuk mengaktifkan modul ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Amplop Digital & Kado</h2>
        <p className="text-sm text-gray-500 mt-1">Sediakan bank transfer atau e-wallet untuk kado pernikahan tanpa tatap muka bagi kerabat jauh.</p>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {giftsList.map((gift, index) => (
          <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 relative">
            <button 
              type="button" onClick={() => handleRemoveGift(index)}
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
                    if (val === 'Kirim Kado' && activePackage === 'gold' && profile?.role !== 'super_admin') {
                      alert("Metode 'Kirim Kado Fisik' hanya tersedia untuk paket Platinum.");
                      return;
                    }
                    handleFieldChange(index, 'type', val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-primary-500 text-xs font-bold bg-white"
                >
                  <option value="Bank">Transfer Bank</option>
                  <option value="E-Wallet">Dompet Digital (E-Wallet)</option>
                  {(activePackage === 'platinum' || profile?.role === 'super_admin') ? (
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
                      onChange={(e) => handleFieldChange(index, 'bank_name', e.target.value)}
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
                        type="text" placeholder="No. Rekening" required value={gift.account_number}
                        onChange={(e) => handleFieldChange(index, 'account_number', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                      />
                      <input 
                        type="text" placeholder="Nama Pemilik" required value={gift.account_name}
                        onChange={(e) => handleFieldChange(index, 'account_name', e.target.value)}
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
                      onChange={(e) => handleFieldChange(index, 'ewallet_name', e.target.value)}
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
                        type="text" placeholder="No. HP" required value={gift.account_number}
                        onChange={(e) => handleFieldChange(index, 'account_number', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                      />
                      <input 
                        type="text" placeholder="Nama Terdaftar" required value={gift.account_name}
                        onChange={(e) => handleFieldChange(index, 'account_name', e.target.value)}
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
                    type="text" placeholder="Jalan, RT/RW, Kecamatan, Kota, Kode Pos" required value={gift.address}
                    onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button" onClick={handleAddGift}
        className="mt-2 w-full border border-dashed border-gray-300 rounded-xl py-3 text-xs font-bold text-gray-600 hover:border-primary-500 hover:text-primary-500 transition flex items-center justify-center gap-1 bg-white"
      >
        <Plus className="w-4 h-4" /> Tambah Rekening / Alamat Pengiriman
      </button>
    </div>
  );
};
