import { useState, useEffect, useRef, FormEvent } from 'react';
import { musicLibraryService } from '../../../../services';
import { MusicLibrary } from '../../../../types/database.types';
import { useAuthStore } from '../../../../stores/authStore';
import { parseMp3Metadata } from '../../../../utils/mp3Metadata';

export interface StagedBgm {
  id: string;
  file: File;
  title: string;
  artist: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export const useBgmManager = () => {
  const { user, profile } = useAuthStore();
  const [bgmList, setBgmList] = useState<MusicLibrary[]>([]);
  const [bgmLoading, setBgmLoading] = useState(true);
  
  // Staging state for bulk uploads
  const [stagedBgms, setStagedBgms] = useState<StagedBgm[]>([]);
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

  const addStagedBgms = async (files: FileList | File[]) => {
    const newStagedItems: StagedBgm[] = [];
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      // Validate file type
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
        alert(`File "${file.name}" harus berupa MP3!`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" melebihi batas 10MB!`);
        continue;
      }

      // Read metadata using the utility
      const meta = await parseMp3Metadata(file);
      newStagedItems.push({
        id: crypto.randomUUID(),
        file,
        title: meta.title,
        artist: meta.artist,
        status: 'idle',
      });
    }

    setStagedBgms((prev) => [...prev, ...newStagedItems]);
  };

  const updateStagedBgm = (id: string, updates: Partial<Pick<StagedBgm, 'title' | 'artist'>>) => {
    setStagedBgms((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeStagedBgm = (id: string) => {
    setStagedBgms((prev) => prev.filter((item) => item.id !== id));
  };

  const clearStagedBgms = () => {
    setStagedBgms([]);
  };

  const handleUploadBgm = async (e: FormEvent) => {
    e.preventDefault();
    if (stagedBgms.length === 0) {
      alert('Belum ada lagu BGM yang dipilih.');
      return;
    }

    if (!user) {
      alert('Sesi tidak ditemukan. Silakan login kembali.');
      return;
    }
    if (!profile || profile.role !== 'super_admin') {
      alert('Anda tidak memiliki izin untuk mengunggah BGM bersama (khusus admin).');
      return;
    }

    setIsBgmUploading(true);

    try {
      // Create a snapshot list of current staged items to process sequentially
      const itemsToUpload = [...stagedBgms];

      for (const item of itemsToUpload) {
        if (item.status === 'success') continue;

        // Set status to uploading
        setStagedBgms((prev) =>
          prev.map((staged) =>
            staged.id === item.id ? { ...staged, status: 'uploading' } : staged
          )
        );

        try {
          await musicLibraryService.uploadAndSaveTrack(
            item.file,
            item.title.trim() || 'Untitled BGM',
            item.artist.trim() || 'Unknown',
            false, // Public shared track
            user.id,
            profile.role
          );

          setStagedBgms((prev) =>
            prev.map((staged) =>
              staged.id === item.id ? { ...staged, status: 'success' } : staged
            )
          );
        } catch (err: any) {
          console.error(`Error uploading "${item.title}":`, err);
          setStagedBgms((prev) =>
            prev.map((staged) =>
              staged.id === item.id
                ? { ...staged, status: 'error', errorMessage: err.message || 'Gagal mengunggah.' }
                : staged
            )
          );
        }
      }

      await loadBgmList();

      // Check if there are any errors in the final state
      let finalHasErrors = false;
      setStagedBgms((prev) => {
        finalHasErrors = prev.some((item) => item.status === 'error');
        return prev;
      });
      
      // Wait a moment and then remove successful items from staging
      setTimeout(() => {
        setStagedBgms((prev) => {
          const remaining = prev.filter((item) => item.status !== 'success');
          if (remaining.length === 0 && !finalHasErrors) {
            alert('Semua lagu BGM berhasil ditambahkan ke perpustakaan!');
          } else if (finalHasErrors) {
            alert('Beberapa lagu gagal diunggah. Silakan cek detail error.');
          }
          return remaining;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error during bulk BGM upload:', err);
      alert('Terjadi kesalahan saat mengunggah lagu.');
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
    stagedBgms,
    isBgmUploading,
    playingBgmId,
    addStagedBgms,
    updateStagedBgm,
    removeStagedBgm,
    clearStagedBgms,
    loadBgmList,
    handleUploadBgm,
    handleDeleteBgm,
    togglePlayBgm,
  };
};
