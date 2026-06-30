import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface FeedbackProps {
  feedback: {
    status: 'success' | 'error' | 'warning' | null;
    message: string;
    guestName?: string;
    guestCode?: string;
    timestamp?: string;
  };
}

export function CheckInFeedbackCard({ feedback }: FeedbackProps) {
  if (!feedback.status) return null;

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      feedback.status === 'success' 
        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
        : feedback.status === 'warning'
        ? 'bg-amber-50/90 border-amber-200 text-amber-955'
        : 'bg-rose-50/90 border-rose-200 text-rose-900'
    }`}>
      <div className="flex gap-4 items-start">
        <div className={`p-2.5 rounded-2xl ${
          feedback.status === 'success' 
            ? 'bg-emerald-100 text-emerald-600' 
            : feedback.status === 'warning'
            ? 'bg-amber-100 text-amber-600'
            : 'bg-rose-100 text-rose-500'
        }`}>
          {feedback.status === 'success' ? (
            <Check className="w-6 h-6" />
          ) : feedback.status === 'warning' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-60">Status Registrasi</p>
            <h4 className="font-bold text-sm mt-0.5 leading-snug">{feedback.message}</h4>
          </div>

          {feedback.guestName && (
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40 space-y-2">
              <div>
                <p className="text-[9px] uppercase tracking-wider font-extrabold opacity-50">Nama Tamu</p>
                <p className="font-serif font-bold text-gray-800 text-lg leading-snug">{feedback.guestName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="font-bold opacity-50 uppercase">Kode Tiket</p>
                  <p className="font-mono font-bold text-gray-700">{feedback.guestCode}</p>
                </div>
                <div>
                  <p className="font-bold opacity-50 uppercase">Pukul Masuk</p>
                  <p className="font-mono font-semibold text-gray-700">{feedback.timestamp}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
