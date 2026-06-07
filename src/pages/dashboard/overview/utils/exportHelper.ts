import { Guest } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';

export const handleExportExcel = async (
  selectedInvitation: { id: string; groom_name: string; bride_name: string },
  guests: Guest[],
  setExporting: (exporting: boolean) => void
) => {
  if (!selectedInvitation || guests.length === 0) {
    alert('Tidak ada data tamu diundang untuk di-export.');
    return;
  }
  try {
    setExporting(true);
    const { data: checkins, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('invitation_id', selectedInvitation.id);

    const checkInMap = new Map();
    if (!error && checkins) {
      checkins.forEach((c: any) => {
        checkInMap.set(c.guest_id, c.checked_in_at);
      });
    }

    const csvHeader = 'No,Nama Tamu,WhatsApp,Kode Tiket,Status RSVP,Kehadiran Check-In,Waktu Registrasi Masuk,Link Undangan\n';
    const csvRows = guests.map((gst, idx) => {
      const checkinTime = checkInMap.get(gst.id);
      const formatRsvp = gst.rsvp_status === 'attending' 
        ? 'Hadir' 
        : gst.rsvp_status === 'declined' 
        ? 'Absen (Tidak Hadir)' 
        : gst.rsvp_status === 'uncertain'
        ? 'Ragu-ragu'
        : 'Belum Merespon';
      
      const formatCheckin = gst.checkin_status === 'checked_in' ? 'SUDAH HADIR' : 'BELUM HADIR';
      const formattedTime = checkinTime ? new Date(checkinTime).toLocaleString('id-ID') : '-';
      const safeName = gst.name.replace(/,/g, ' ');
      const safePhone = gst.phone ? `'${gst.phone}` : '-';

      return `${idx + 1},"${safeName}",${safePhone},${gst.guest_code},${formatRsvp},${formatCheckin},${formattedTime},${gst.personal_link || '-'}`;
    }).join('\n');

    const csvContent = '\uFEFF' + csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `RSVP_Checkin_${selectedInvitation.groom_name}_${selectedInvitation.bride_name}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err: any) {
    console.error('Error exporting sheet:', err);
    alert('Gagal mengexport file ke Excel.');
  } finally {
    setExporting(false);
  }
};
