import React, { useState, useRef } from 'react';
import { Guest, Invitation } from '../../../../types/database.types';
import { guestService } from '../../../../services';
import { normalizeWhatsApp, generateGuestCode } from '../utils/guestNormalizer';

export const useGuestImport = (
  selectedInvitation: Invitation | null,
  invitationTier: 'silver' | 'gold' | 'platinum',
  guests: Guest[],
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>,
  setActionLoading: (loading: boolean) => void,
  actionLoading: boolean,
  setShowImportModal: (show: boolean) => void
) => {
  const [csvText, setCsvText] = useState('');
  const [importResults, setImportResults] = useState<Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed'; error?: string }>>([]);
  const [importLogs, setImportLogs] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVcf = file.name.toLowerCase().endsWith('.vcf');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        if (isVcf) {
          parseVCFAndPrepareImport(text);
        } else {
          setCsvText(text);
          parseAndPrepareImport(text);
        }
      }
    };
    reader.readAsText(file);
  };

  const parseVCFAndPrepareImport = (text: string) => {
    const vcards = text.split("BEGIN:VCARD");
    const parsed: Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed' }> = [];

    vcards.forEach((card) => {
      if (!card.trim()) return;
      const fnMatch = card.match(/FN:(.+)/);
      const telMatch = card.match(/TEL(?:;[^:]*)?:(.+)/);

      if (fnMatch) {
        const name = fnMatch[1].trim().replace(/^["']|["']$/g, '');
        let phone = telMatch ? telMatch[1].replace(/[^0-9+]/g, '').trim() : '';
        if (name && phone) {
          parsed.push({ name, phone, status: 'pending' });
        }
      }
    });

    setImportResults(parsed);
    setCsvText(parsed.map(p => `${p.name},${p.phone}`).join('\n'));
    setImportLogs(`Terdeteksi ${parsed.length} kontak dari file .VCF siap di-import.`);
  };

  const parseAndPrepareImport = (text: string) => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const parsed: Array<{ name: string; phone: string; status: 'pending' | 'success' | 'failed' }> = [];

    let startIndex = 0;
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase();
      if (
        firstLine.includes('name') || 
        firstLine.includes('phone') || 
        firstLine.includes('nama') || 
        firstLine.includes('telp') || 
        firstLine.includes('wa') || 
        firstLine.includes('no')
      ) {
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split(/[,;]/);
      if (columns.length >= 2) {
        parsed.push({
          name: columns[0].trim().replace(/^["']|["']$/g, ''),
          phone: columns[1].trim().replace(/^["']|["']$/g, ''),
          status: 'pending'
        });
      } else if (columns.length === 1 && line.includes('\t')) {
        const tabCols = line.split('\t');
        if (tabCols.length >= 2) {
          parsed.push({
            name: tabCols[0].trim(),
            phone: tabCols[1].trim(),
            status: 'pending'
          });
        }
      }
    }

    setImportResults(parsed);
    setImportLogs(`Terdeteksi ${parsed.length} baris data calon tamu siap di-import.`);
  };

  const handleExecuteImport = async () => {
    if (!selectedInvitation || importResults.length === 0) return;
    const maxGuests = invitationTier === 'silver' ? 150 : invitationTier === 'gold' ? 500 : Infinity;
    if (guests.length + importResults.length > maxGuests) {
      alert(`Gagal Impor! Kuota melebihi kuota maksimal Paket ${invitationTier.toUpperCase()} (${maxGuests} Tamu).`);
      return;
    }

    try {
      setActionLoading(true);
      setImportLogs('Sedang mengimpor data tamu satu per satu...');
      const existingCodes = new Set(guests.map(g => g.guest_code));
      const successes: Guest[] = [];
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < importResults.length; i++) {
        const item = importResults[i];
        try {
          const normalized = normalizeWhatsApp(item.phone);
          let guestCode = generateGuestCode();
          while (existingCodes.has(guestCode)) {
            guestCode = generateGuestCode();
          }
          existingCodes.add(guestCode);

          const personalLink = `https://nikahyuk.id/${selectedInvitation.slug}?guest=${guestCode}`;
          const newGuest = await guestService.create({
            invitation_id: selectedInvitation.id,
            name: item.name,
            phone: normalized,
            guest_code: guestCode,
            personal_link: personalLink,
            qr_code_value: guestCode,
            sent_status: 'unsent',
            rsvp_status: 'pending',
            checkin_status: 'pending'
          });
          successes.push(newGuest);
          importResults[i].status = 'success';
          successCount++;
        } catch (itemErr: any) {
          console.error(`Import failed at row ${i}:`, itemErr);
          importResults[i].status = 'failed';
          importResults[i].error = itemErr.message || 'DB Error';
          failureCount++;
        }
      }

      setGuests(prev => [...prev, ...successes]);
      setImportLogs(`Selesai! Berhasil mengimpor ${successCount} tamu. Gagal: ${failureCount}.`);
      alert(`Proses import selesai. Berhasil: ${successCount}, Gagal: ${failureCount}`);

      if (failureCount === 0) {
        setTimeout(() => {
          setShowImportModal(false);
          setCsvText('');
          setImportResults([]);
          setImportLogs(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Migration failure:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    csvText,
    setCsvText,
    importResults,
    importLogs,
    fileInputRef,
    handleFileChange,
    parseAndPrepareImport,
    handleExecuteImport,
  };
};
