import { useState, FormEvent } from 'react';
import { promoService } from '../../../../services';

export const usePromos = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Promo Form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState(0);
  const [newPromoMinTx, setNewPromoMinTx] = useState(0);
  const [newPromoLimit, setNewPromoLimit] = useState('');
  const [newPromoExpiry, setNewPromoExpiry] = useState('');

  // Apply Promo
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const loadPromos = async () => {
    try {
      setLoadingPromos(true);
      const data = await promoService.getAll();
      setPromos(data);
    } catch (err) {
      console.error('Error fetching promos:', err);
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Masukkan kode promo terlebih dahulu.');
      return;
    }
    setPromoError(null);
    setPromoSuccess(null);
    setCheckingPromo(true);
    try {
      const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
      const list = await cloudflareApi.getTableRows('promos', { code: promoCode.trim().toUpperCase() });
      let data: any = null;
      if (list && list.length > 0) {
        data = list[0];
      }

      if (!data) {
        setPromoError('Kode promo tidak ditemukan atau tidak valid.');
        setAppliedPromo(null);
        return;
      }
      if (data.status !== 'active') {
        setPromoError('Kode promo ini sudah tidak aktif.');
        setAppliedPromo(null);
        return;
      }
      if (data.expired_at && new Date(data.expired_at) < new Date()) {
        setPromoError('Kode promo ini sudah kedaluwarsa.');
        setAppliedPromo(null);
        return;
      }
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        setPromoError('Kuota penggunaan kode promo ini sudah habis.');
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(data);
      const discountText = data.discount_type === 'percentage' 
        ? `${data.discount_value}%` 
        : `Rp ${data.discount_value.toLocaleString('id-ID')}`;
      setPromoSuccess(`Kode promo "${data.code}" berhasil diterapkan! Diskon ${discountText}.`);
    } catch (err) {
      console.error('Error applying promo:', err);
      setPromoError('Terjadi kesalahan saat memvalidasi kode promo.');
    } finally {
      setCheckingPromo(false);
    }
  };

  const getDiscountedPrice = (pkgPrice: number) => {
    if (!appliedPromo || pkgPrice < Number(appliedPromo.min_transaction)) return pkgPrice;
    if (appliedPromo.discount_type === 'percentage') {
      const discount = (pkgPrice * Number(appliedPromo.discount_value)) / 100;
      return Math.max(0, pkgPrice - discount);
    }
    return Math.max(0, pkgPrice - Number(appliedPromo.discount_value));
  };

  const getDiscountAmount = (pkgPrice: number) => {
    if (!appliedPromo || pkgPrice < Number(appliedPromo.min_transaction)) return 0;
    if (appliedPromo.discount_type === 'percentage') {
      return (pkgPrice * Number(appliedPromo.discount_value)) / 100;
    }
    return Number(appliedPromo.discount_value);
  };

  const handleCreatePromo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) {
      alert('Kode promo wajib diisi.');
      return;
    }
    if (newPromoValue <= 0) {
      alert('Nilai diskon harus lebih besar dari 0.');
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        code: newPromoCode.trim().toUpperCase(),
        discount_type: newPromoType,
        discount_value: Number(newPromoValue),
        min_transaction: Number(newPromoMinTx),
        usage_limit: newPromoLimit ? Number(newPromoLimit) : null,
        usage_count: 0,
        status: 'active',
        expired_at: newPromoExpiry ? new Date(newPromoExpiry).toISOString() : null,
      };

      const data = await promoService.create(payload);

      setPromos(prev => [data, ...prev]);
      alert(`Kode Promo "${payload.code}" berhasil dibuat!`);
      setShowPromoModal(false);
      setNewPromoCode('');
      setNewPromoType('percentage');
      setNewPromoValue(0);
      setNewPromoMinTx(0);
      setNewPromoLimit('');
      setNewPromoExpiry('');
    } catch (err: any) {
      console.error('Error creating promo:', err);
      alert(`Gagal membuat promo: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePromoStatus = async (promo: any) => {
    const nextStatus = promo.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoading(true);
      await promoService.update(promo.id, { status: nextStatus });
      setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, status: nextStatus } : p));
    } catch (err: any) {
      console.error('Error toggling promo status:', err);
      alert(`Gagal memperbarui status promo: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (!window.confirm(`Hapus kode promo "${code}"?`)) return;
    try {
      setActionLoading(true);
      await promoService.delete(id);
      setPromos(prev => prev.filter(p => p.id !== id));
      alert('Kode promo berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting promo:', err);
      alert(`Gagal menghapus promo: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    promos,
    setPromos,
    loadingPromos,
    setLoadingPromos,
    showPromoModal,
    setShowPromoModal,
    newPromoCode,
    setNewPromoCode,
    newPromoType,
    setNewPromoType,
    newPromoValue,
    setNewPromoValue,
    newPromoMinTx,
    setNewPromoMinTx,
    newPromoLimit,
    setNewPromoLimit,
    newPromoExpiry,
    setNewPromoExpiry,
    promoCode,
    setPromoCode,
    appliedPromo,
    setAppliedPromo,
    promoError,
    setPromoError,
    promoSuccess,
    setPromoSuccess,
    checkingPromo,
    loadPromos,
    handleApplyPromo,
    getDiscountedPrice,
    getDiscountAmount,
    handleCreatePromo,
    handleTogglePromoStatus,
    handleDeletePromo,
    actionLoading,
  };
};
