import { useState, useRef, useEffect } from 'react';
import { MusicLibrary } from '../../../../types/database.types';
import { musicLibraryService } from '../../../../services';

export const useMusicSelector = (
  userId: string | undefined,
  profileName: string | undefined,
  role: 'super_admin' | 'customer' | undefined,
  activePackage: 'silver' | 'gold' | 'platinum',
  selectedMusicUrl: string | undefined,
  onMusicSelect: (url: string, title: string) => void
) => {
  const [libraryBgms, setLibraryBgms] = useState<MusicLibrary[]>([]);
  const [bgmsLoading, setBgmsLoading] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isUploadingPrivateBgm, setIsUploadingPrivateBgm] = useState(false);

  const playAudioRef = useRef<HTMLAudioElement | null>(null);

  const loadBgmLibrary = async () => {
    try {
      setBgmsLoading(true);
      const list = await musicLibraryService.getAll();
      setLibraryBgms(list || []);
    } catch (err) {
      console.error('Error fetching BGM library:', err);
    } finally {
      setBgmsLoading(false);
    }
  };

  const togglePlayTrack = (trackId: string, url: string) => {
    if (playingTrackId === trackId) {
      playAudioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (playAudioRef.current) {
        playAudioRef.current.pause();
      }
      playAudioRef.current = new Audio(url);
      playAudioRef.current.play();
      setPlayingTrackId(trackId);
      playAudioRef.current.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleUploadPrivateBgm = async (file: File) => {
    if (!file || !userId) return;

    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      alert('Tipe file tidak didukung. File harus berupa MP3.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file musik terlalu besar. Maksimal adalah 10 MB.');
      return;
    }

    setIsUploadingPrivateBgm(true);
    try {
      const songTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const track = await musicLibraryService.uploadAndSaveTrack(
        file,
        songTitle,
        profileName || 'Pribadi',
        true,
        userId,
        role || 'customer'
      );

      alert('Musik pribadi berhasil diunggah!');
      await loadBgmLibrary();
      onMusicSelect(track.url, track.title);
    } catch (err: any) {
      console.error('Error uploading private BGM:', err);
      alert(err.message || 'Gagal mengunggah BGM privat.');
    } finally {
      setIsUploadingPrivateBgm(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadBgmLibrary();
    }
  }, [userId]);

  useEffect(() => {
    return () => {
      if (playAudioRef.current) {
        playAudioRef.current.pause();
      }
    };
  }, []);

  return {
    libraryBgms,
    bgmsLoading,
    playingTrackId,
    isUploadingPrivateBgm,
    togglePlayTrack,
    handleUploadPrivateBgm,
    loadBgmLibrary,
  };
};
