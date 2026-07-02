import { useState, useEffect, useRef, FormEvent } from 'react';
import { musicLibraryService } from '../../../../services';
import { MusicLibrary } from '../../../../types/database.types';
import { useAuthStore } from '../../../../stores/authStore';

export const useBgmManager = () => {
  const { user, profile } = useAuthStore();
  const [bgmList, setBgmList] = useState<MusicLibrary[]>([]);
  const [bgmLoading, setBgmLoading] = useState(true);
  const [newBgmFile, setNewBgmFile] = useState<File | null>(null);
  const [newBgmTitle, setNewBgmTitle] = useState('');
  const [newBgmArtist, setNewBgmArtist] = useState('');
  const [isBgmUploading, setIsBgmUploading] = useState(false);
  const [playingBgmId, setPlayingBgmId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadBgmList = async () => {
    try {
      setBgmLoading(true);
      const list = await musicLibraryService.getAll();
      setBgmList(list || []);
    } catch (err) {
      console.error('Error fetching database BGMs:', err);
    } finally {
      setBgmLoading(false);
    }
  };

  const handleUploadBgm = async (e: FormEvent) => {
    e.preventDefault();
    if (!newBgmFile) {
      alert('Silakan pilih berkas MP3 terlebih dahulu.');
      return;
    }
    if (!newBgmTitle.trim()) {
      alert('Silakan masukkan judul lagu.');
      return;
    }

    setIsBgmUploading(true);
    try {
      if (!user) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');
      if (!profile || profile.role !== 'super_admin') {
        throw new Error('Anda tidak memiliki izin untuk mengunggah BGM bersama (khusus admin).');
      }

      await musicLibraryService.uploadAndSaveTrack(
        newBgmFile,
        newBgmTitle.trim(),
        newBgmArtist.trim() || 'Unknown',
        false, // Public shared track
        user.id,
        profile.role
      );

      alert('BGM bersama berhasil ditambahkan ke perpustakaan!');
      setNewBgmFile(null);
      setNewBgmTitle('');
      setNewBgmArtist('');
      await loadBgmList();
    } catch (err: any) {
      console.error('Error uploading BGM:', err);
      alert(err.message || 'Gagal menambahkan lagu.');
    } finally {
      setIsBgmUploading(false);
    }
  };

  const handleDeleteBgm = async (id: string, fileUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lagu BGM ini dari perpustakaan?')) return;

    try {
      if (fileUrl.includes('/music/')) {
        const filePath = fileUrl.split('/music/').pop();
        if (filePath) {
          const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
          await cloudflareApi.deleteFile(decodeURIComponent(filePath));
        }
      }

      await musicLibraryService.delete(id);
      alert('BGM berhasil dihapus dari perpustakaan.');
      await loadBgmList();
    } catch (err) {
      console.error('Error deleting BGM:', err);
      alert('Gagal menghapus BGM.');
    }
  };

  const togglePlayBgm = (id: string, url: string) => {
    if (playingBgmId === id) {
      audioRef.current?.pause();
      setPlayingBgmId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingBgmId(id);
      audioRef.current.onended = () => {
        setPlayingBgmId(null);
      };
    }
  };

  useEffect(() => {
    loadBgmList();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return {
    bgmList,
    bgmLoading,
    newBgmFile,
    newBgmTitle,
    newBgmArtist,
    isBgmUploading,
    playingBgmId,
    setNewBgmFile,
    setNewBgmTitle,
    setNewBgmArtist,
    loadBgmList,
    handleUploadBgm,
    handleDeleteBgm,
    togglePlayBgm,
  };
};
