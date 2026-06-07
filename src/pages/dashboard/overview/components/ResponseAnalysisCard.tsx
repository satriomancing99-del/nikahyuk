import React from 'react';

interface ResponseAnalysisCardProps {
  rsvpHadir: number;
  rsvpRagu: number;
  rsvpAbsen: number;
  percentRsvpHadir: number;
  percentRsvpRagu: number;
  percentRsvpAbsen: number;
}

export function ResponseAnalysisCard({
  rsvpHadir,
  rsvpRagu,
  rsvpAbsen,
  percentRsvpHadir,
  percentRsvpRagu,
  percentRsvpAbsen
}: ResponseAnalysisCardProps) {
  return (
    <div className="lg:col-span-7 bg-white border border-gray-150 shadow-sm rounded-3xl p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-gray-900">Analisis Respons & Kehadiran</h3>
        <p className="text-xs text-gray-400 mt-0.5">Visual persentase status kesiapan kuota katering hidangan.</p>
      </div>

      <div className="space-y-5">
        {/* RSVP Distribution bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-500 flex items-center gap-1.5">😇 Berencana Hadir</span>
            <span className="text-gray-900">{rsvpHadir} Tamu • {percentRsvpHadir}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 rounded-full transition-all duration-1000" 
              style={{ width: `${percentRsvpHadir}%` }}
            />
          </div>
        </div>

        {/* RSVP Ragu bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-500 flex items-center gap-1.5">🤔 Ragu-Ragu Kehadiran</span>
            <span className="text-gray-900">{rsvpRagu} Tamu • {percentRsvpRagu}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-1000" 
              style={{ width: `${percentRsvpRagu}%` }}
            />
          </div>
        </div>

        {/* RSVP Absen bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-500 flex items-center gap-1.5">😔 Tidak Bisa Hadir (Absen)</span>
            <span className="text-gray-900">{rsvpAbsen} Tamu • {percentRsvpAbsen}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-400 rounded-full transition-all duration-1000" 
              style={{ width: `${percentRsvpAbsen}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
