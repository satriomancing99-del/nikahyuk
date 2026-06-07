import React from 'react';
import { Calendar } from 'lucide-react';

interface EventScheduleStepProps {
  eventAkad: {
    title: string; date: string; start_time: string; end_time: string;
    location_name: string; address: string; google_maps_url: string;
  };
  setEventAkad: React.Dispatch<React.SetStateAction<any>>;
  eventResepsi: {
    title: string; date: string; start_time: string; end_time: string;
    location_name: string; address: string; google_maps_url: string;
  };
  setEventResepsi: React.Dispatch<React.SetStateAction<any>>;
}

export const EventScheduleStep: React.FC<EventScheduleStepProps> = ({
  eventAkad,
  setEventAkad,
  eventResepsi,
  setEventResepsi,
}) => {
  return (
    <div className="space-y-6 text-left">
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
                  type="date" required value={eventAkad.date}
                  onChange={(e) => setEventAkad((prev: any) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                  <input 
                    type="time" value={eventAkad.start_time}
                    onChange={(e) => setEventAkad((prev: any) => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                  <input 
                    type="time" value={eventAkad.end_time}
                    onChange={(e) => setEventAkad((prev: any) => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Tempat / Gedung</label>
                <input 
                  type="text" required placeholder="Contoh: Masjid Agung Al-Azhar"
                  value={eventAkad.location_name}
                  onChange={(e) => setEventAkad((prev: any) => ({ ...prev, location_name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  rows={2} required placeholder="Contoh: Jalan Sisingamangaraja No.1, Kebayoran Baru, Jakarta Selatan"
                  value={eventAkad.address}
                  onChange={(e) => setEventAkad((prev: any) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  Link Google Maps <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                </label>
                <input 
                  type="url" placeholder="Contoh: https://maps.app.goo.gl/..."
                  value={eventAkad.google_maps_url}
                  onChange={(e) => setEventAkad((prev: any) => ({ ...prev, google_maps_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
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
                  type="date" required value={eventResepsi.date}
                  onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Mulai</label>
                  <input 
                    type="time" value={eventResepsi.start_time}
                    onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jam Selesai</label>
                  <input 
                    type="time" value={eventResepsi.end_time}
                    onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Tempat / Gedung</label>
                <input 
                  type="text" required placeholder="Contoh: Balai Kartini Grand Ballroom"
                  value={eventResepsi.location_name}
                  onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, location_name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  rows={2} required placeholder="Contoh: Jenderal Gatot Subroto Kav. 37, kuningan timur, jakarta selatan"
                  value={eventResepsi.address}
                  onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  Link Google Maps <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
                </label>
                <input 
                  type="url" placeholder="Contoh: https://maps.app.goo.gl/..."
                  value={eventResepsi.google_maps_url}
                  onChange={(e) => setEventResepsi((prev: any) => ({ ...prev, google_maps_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
