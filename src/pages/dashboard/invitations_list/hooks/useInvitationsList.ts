import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService } from '../../../../services';
import { Invitation } from '../../../../types/database.types';

export function useInvitationsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && (location.state as any).showDonation) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-donation-modal'));
      }, 500);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    async function loadInvitations() {
      if (!user) return;
      try {
        setLoading(true);
        const list = profile?.role === 'super_admin' 
          ? await invitationService.getAll() 
          : await invitationService.getByUserId(user.id);
        setInvitations(list);
      } catch (err) {
        console.error('Error fetching invitations list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile?.role]);

  const handleCopyLink = (slug: string) => {
    const url = `https://nikahyuk.id/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCreateNewClick = (e: React.MouseEvent) => {
    if (profile?.role === 'customer') {
      const activeCount = invitations.filter(inv => inv.status === 'published').length;
      if (activeCount >= 2) {
        e.preventDefault();
        alert('Batas Undangan Aktif Terlampaui!\n\nSebagai customer, Anda telah mencapai batas maksimal 2 undangan aktif/diterbitkan secara bersamaan.\n\nSilakan hapus atau ubah status undangan aktif Anda yang lain terlebih dahulu sebelum membuat undangan baru.');
        return;
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus undangan ini secara permanen? Semua data tamu, RSVP, & galeri terkait akan ikut terhapus.')) {
      return;
    }
    try {
      await invitationService.delete(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      alert('Undangan berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting invitation:', err);
      alert(`Gagal menghapus undangan: ${err.message || 'Kesalahan sistem'}`);
    }
  };

  return {
    navigate,
    invitations,
    loading,
    copiedSlug,
    handleCopyLink,
    handleCreateNewClick,
    handleDelete
  };
}
