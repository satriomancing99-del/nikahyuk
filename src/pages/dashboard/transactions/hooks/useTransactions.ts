import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { transactionService, packageService, storageService } from '../../../../services';
import { Transaction, Package } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';

const FALLBACK_PACKAGES: Package[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Paket Silver',
    price: 49000,
    features: { duration: 3, guests: 150, photos: 3, bgm: 'standard' },
    active_period: 90,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Paket Gold',
    price: 99000,
    features: { duration: 6, guests: 500, photos: 8, bgm: 'custom' },
    active_period: 180,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Paket Platinum',
    price: 149000,
    features: { duration: 12, guests: 1000000, photos: 12, bgm: 'custom' },
    active_period: 365,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

export const useTransactions = () => {
  const { profile } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      let pkgsList = await packageService.getAll();
      if (pkgsList.length === 0) {
        const seeded: Package[] = [];
        for (const item of FALLBACK_PACKAGES) {
          try {
            const res = await packageService.create(item);
            seeded.push(res);
          } catch (err) {
            console.error('Error seeding package:', err);
          }
        }
        pkgsList = seeded.length > 0 ? seeded : FALLBACK_PACKAGES;
      }
      setPackages(pkgsList);

      let txList: Transaction[] = [];
      if (import.meta.env.VITE_USE_D1_AUTH === 'true') {
        const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
        if (profile.role === 'super_admin') {
          txList = await cloudflareApi.getTableRows<Transaction>('transactions');
        } else {
          txList = await cloudflareApi.getTableRows<Transaction>('transactions', { user_id: profile.id });
        }
      } else {
        if (profile.role === 'super_admin') {
          const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
          txList = (data || []) as Transaction[];
        } else {
          const { data } = await supabase.from('transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
          txList = (data || []) as Transaction[];
        }
      }
      setTransactions(txList);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (txId: string, file: File) => {
    if (!profile) return;
    try {
      setActionLoading(true);
      const publicUrl = await storageService.uploadPaymentProof(txId, profile.id, file);
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, proof_url: publicUrl } : t));
      alert('Bukti transfer pembayaran berhasil diunggah! Mohon tunggu konfirmasi admin.');
    } catch (err: any) {
      console.error('Proof upload error:', err);
      alert(`Gagal mengunggah bukti: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveTransaction = async (id: string) => {
    if (!window.confirm('Setujui transaksi ini?')) return;
    try {
      setActionLoading(true);
      
      const isD1 = import.meta.env.VITE_USE_D1_AUTH === 'true';
      const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
      
      let tx: Transaction | null = null;
      if (isD1) {
        tx = await cloudflareApi.getTableRowById<Transaction>('transactions', id);
      } else {
        const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
        if (error) throw error;
        tx = data;
      }
      if (!tx) throw new Error('Transaksi tidak ditemukan.');

      const pkg = packages.find(p => p.id === tx.package_id);
      const activePeriodDays = pkg?.active_period || 365;
      const activatedAt = new Date();
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + activePeriodDays);

      if (isD1) {
        await cloudflareApi.updateTableRow('transactions', id, {
          payment_status: 'success',
          activated_at: activatedAt.toISOString(),
          expired_at: expiredAt.toISOString()
        });

        const invs = await cloudflareApi.getInvitationsByUserId(tx.user_id);
        if (invs && invs.length > 0) {
          await cloudflareApi.updateTableRow('invitations', invs[0].id, {
            expired_at: expiredAt.toISOString()
          });
        }
      } else {
        const { error: updateErr } = await supabase.from('transactions').update({
          payment_status: 'success',
          activated_at: activatedAt.toISOString(),
          expired_at: expiredAt.toISOString()
        }).eq('id', id);
        if (updateErr) throw updateErr;

        const { data: invs } = await supabase.from('invitations').select('id').eq('user_id', tx.user_id).limit(1);
        if (invs && invs.length > 0) {
          await supabase.from('invitations').update({ expired_at: expiredAt.toISOString() }).eq('id', invs[0].id);
        }
      }

      setTransactions(prev => prev.map(t => t.id === id ? { ...t, payment_status: 'success', activated_at: activatedAt.toISOString(), expired_at: expiredAt.toISOString() } : t));
      alert('Transaksi disetujui!');
    } catch (err: any) {
      console.error('Error approving transaction:', err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTransaction = async (id: string) => {
    if (!window.confirm('Tolak transaksi ini?')) return;
    try {
      setActionLoading(true);
      await transactionService.update(id, { payment_status: 'failed' });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, payment_status: 'failed' } : t));
      alert('Transaksi ditolak.');
    } catch (err: any) {
      console.error('Error rejecting:', err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyProofLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Tautan bukti transfer disalin!');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini permanen?')) return;
    try {
      setActionLoading(true);
      if (import.meta.env.VITE_USE_D1_AUTH === 'true') {
        const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
        await cloudflareApi.deleteTableRow('transactions', id);
      } else {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      alert('Transaksi dihapus.');
    } catch (err: any) {
      console.error('Error deleting:', err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  return {
    transactions,
    setTransactions,
    packages,
    loading,
    actionLoading,
    setActionLoading,
    loadData,
    handleUploadProof,
    handleApproveTransaction,
    handleRejectTransaction,
    handleDeleteTransaction,
  };
};
