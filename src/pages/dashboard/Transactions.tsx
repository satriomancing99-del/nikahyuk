import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, Search, Filter, Loader2, Calendar, FileText, CheckCircle, 
  XCircle, Clock, Upload, ExternalLink, RefreshCw, AlertCircle, Copy, Check, Eye, Plus, Trash2, Edit, X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { transactionService, packageService, storageService } from '../../services';
import { Transaction, Package } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

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

export default function Transactions() {
  const { profile } = useAuthStore();
  
  // Core States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Purchase States
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Staging modal for customer proof upload
  const [uploadingTxId, setUploadingTxId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Staging image viewer for Admin
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // Admin Editing Transaction states
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingTxStatus, setEditingTxStatus] = useState<string>('pending');
  const [editingTxAmount, setEditingTxAmount] = useState<number>(0);
  const [editingTxActivatedAt, setEditingTxActivatedAt] = useState<string>('');
  const [editingTxExpiredAt, setEditingTxExpiredAt] = useState<string>('');

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(number);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const triggerUploadForPending = (txId: string) => {
    setUploadingTxId(txId);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  // Admin Promo state definitions
  const [adminActiveTab, setAdminActiveTab] = useState<'transactions' | 'promos'>('transactions');
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // New Promo Form states
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState(0);
  const [newPromoMinTx, setNewPromoMinTx] = useState(0);
  const [newPromoLimit, setNewPromoLimit] = useState('');
  const [newPromoExpiry, setNewPromoExpiry] = useState('');

  // Customer Promo applying states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  const loadPromos = async () => {
    try {
      setLoadingPromos(true);
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPromos(data || []);
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
      const { data, error } = await supabase
        .from('promos')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        setPromoError('Kode promo tidak ditemukan atau tidak valid.');
        setAppliedPromo(null);
        return;
      }

      // Validate status
      if (data.status !== 'active') {
        setPromoError('Kode promo ini sudah tidak aktif.');
        setAppliedPromo(null);
        return;
      }

      // Validate expiry
      if (data.expired_at && new Date(data.expired_at) < new Date()) {
        setPromoError('Kode promo ini sudah kedaluwarsa.');
        setAppliedPromo(null);
        return;
      }

      // Validate usage limits
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        setPromoError('Kuota penggunaan kode promo ini sudah habis.');
        setAppliedPromo(null);
        return;
      }

      // Promo is valid!
      setAppliedPromo(data);
      let discountText = '';
      if (data.discount_type === 'percentage') {
        discountText = `${data.discount_value}%`;
      } else {
        discountText = `Rp ${data.discount_value.toLocaleString('id-ID')}`;
      }
      setPromoSuccess(`Kode promo "${data.code}" berhasil diterapkan! Diskon ${discountText}.`);
    } catch (err) {
      console.error('Error applying promo:', err);
      setPromoError('Terjadi kesalahan saat memvalidasi kode promo.');
    } finally {
      setCheckingPromo(false);
    }
  };

  const getDiscountedPrice = (pkgPrice: number) => {
    if (!appliedPromo) return pkgPrice;
    
    if (pkgPrice < Number(appliedPromo.min_transaction)) {
      return pkgPrice;
    }

    if (appliedPromo.discount_type === 'percentage') {
      const discount = (pkgPrice * Number(appliedPromo.discount_value)) / 100;
      return Math.max(0, pkgPrice - discount);
    } else {
      return Math.max(0, pkgPrice - Number(appliedPromo.discount_value));
    }
  };

  const getDiscountAmount = (pkgPrice: number) => {
    if (!appliedPromo) return 0;
    
    if (pkgPrice < Number(appliedPromo.min_transaction)) {
      return 0;
    }

    if (appliedPromo.discount_type === 'percentage') {
      return (pkgPrice * Number(appliedPromo.discount_value)) / 100;
    } else {
      return Number(appliedPromo.discount_value);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
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

      const { data, error } = await supabase
        .from('promos')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        throw new Error('Data promo tidak dikembalikan oleh server.');
      }

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
      alert(`Gagal membuat promo: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePromoStatus = async (promo: any) => {
    const nextStatus = promo.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('promos')
        .update({ status: nextStatus })
        .eq('id', promo.id);

      if (error) throw error;
      
      setPromos(prev => prev.map(p => p && p.id === promo.id ? { ...p, status: nextStatus } : p));
    } catch (err: any) {
      console.error('Error toggling promo status:', err);
      alert(`Gagal memperbarui status promo: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kode promo "${code}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('promos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPromos(prev => prev.filter(p => p && p.id !== id));
      alert('Kode promo berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting promo:', err);
      alert(`Gagal menghapus promo: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Load Transactions & Packages
  const loadData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      
      // Load packages mapping
      let pkgsList = await packageService.getAll();
      if (pkgsList.length === 0) {
        console.log('Packages table is empty. Seeding defaults...');
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

      // Load transactions
      let txList: Transaction[] = [];
      if (profile.role === 'super_admin') {
        // Admins see all transactions in the system

        const { data } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
        txList = (data || []) as Transaction[];

        // Fetch promos
        try {
          setLoadingPromos(true);
          const { data: promosData } = await supabase
            .from('promos')
            .select('*')
            .order('created_at', { ascending: false });
          setPromos(promosData || []);
        } catch (err) {
          console.error('Error fetching promos in loadData:', err);
        } finally {
          setLoadingPromos(false);
        }
      } else {
        // Normal customers see only their own transactions
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        txList = (data || []) as Transaction[];
      }
      setTransactions(txList);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  // Copy Transaction ID to clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Upload Payment Proof (Customer Action)
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTxId || !profile) return;

    try {
      setActionLoading(true);
      // Upload using storage helper
      const publicUrl = await storageService.uploadPaymentProof(uploadingTxId, profile.id, file);
      
      // Local state update
      setTransactions(prev => prev.map(t => 
        t.id === uploadingTxId 
          ? { ...t, proof_url: publicUrl } 
          : t
      ));
      
      alert('Bukti transfer pembayaran berhasil diunggah! Mohon tunggu konfirmasi admin.');
      setUploadingTxId(null);
    } catch (err: any) {
      console.error('Proof upload error:', err);
      alert(`Gagal mengunggah bukti: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Transaction (Admin Action)
  const handleApproveTransaction = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin MENYETUJUI pembayaran transaksi ini dan mengaktifkan fitur paket?')) return;
    try {
      setActionLoading(true);
      
      // Fetch transaction to get package_id and user_id
      const { data: tx, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (txErr || !tx) throw new Error('Transaksi tidak ditemukan.');
      
      // Lookup package active period
      const pkg = packages.find(p => p.id === tx.package_id);
      const activePeriodDays = pkg?.active_period || 365;
      
      const activatedAt = new Date();
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + activePeriodDays);
      
      // Update transaction status and timestamps in database
      const { error: updateErr } = await supabase
        .from('transactions')
        .update({ 
          payment_status: 'success',
          activated_at: activatedAt.toISOString(),
          expired_at: expiredAt.toISOString()
        })
        .eq('id', id);
        
      if (updateErr) throw updateErr;

      // Update kustomer's invitation's expired_at automatically
      const { data: invs } = await supabase
        .from('invitations')
        .select('id')
        .eq('user_id', tx.user_id)
        .limit(1);

      if (invs && invs.length > 0) {
        await supabase
          .from('invitations')
          .update({ expired_at: expiredAt.toISOString() })
          .eq('id', invs[0].id);
      }
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === id 
          ? { 
              ...t, 
              payment_status: 'success', 
              activated_at: activatedAt.toISOString(), 
              expired_at: expiredAt.toISOString() 
            } 
          : t
      ));
      
      alert('Transaksi disetujui! Paket kustomer kini aktif dan masa kedaluwarsa undangan telah dihitung otomatis.');
    } catch (err: any) {
      console.error('Error approving transaction:', err);
      alert(`Gagal menyetujui transaksi: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Transaction (Admin Action)
  const handleRejectTransaction = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin MENOLAK pembayaran transaksi ini?')) return;
    try {
      setActionLoading(true);
      await transactionService.update(id, { payment_status: 'failed' });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, payment_status: 'failed' } : t));
      alert('Transaksi ditolak.');
    } catch (err: any) {
      console.error('Error rejecting transaction:', err);
      alert(`Gagal menolak transaksi: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Transaction (Admin Action)
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin MENGHAPUS riwayat transaksi ini secara permanen dari database? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      alert('Transaksi berhasil dihapus secara permanen.');
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      alert(`Gagal menghapus transaksi: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Transaction Modal (Admin Action)
  const openEditTxModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditingTxStatus(tx.payment_status);
    setEditingTxAmount(Number(tx.amount) || 0);
    setEditingTxActivatedAt(tx.activated_at ? tx.activated_at.substring(0, 16) : '');
    setEditingTxExpiredAt(tx.expired_at ? tx.expired_at.substring(0, 16) : '');
  };

  // Save/Update Edited Transaction (Admin Action)
  const handleUpdateTransaction = async () => {
    if (!editingTx) return;
    try {
      setActionLoading(true);
      
      const activatedAtISO = editingTxActivatedAt ? new Date(editingTxActivatedAt).toISOString() : null;
      const expiredAtISO = editingTxExpiredAt ? new Date(editingTxExpiredAt).toISOString() : null;

      const { error } = await supabase
        .from('transactions')
        .update({
          payment_status: editingTxStatus,
          amount: Number(editingTxAmount),
          activated_at: activatedAtISO,
          expired_at: expiredAtISO
        })
        .eq('id', editingTx.id);

      if (error) throw error;

      // If status changed to success, sync with invitation expired_at
      if (editingTxStatus === 'success' && expiredAtISO) {
        const { data: invs } = await supabase
          .from('invitations')
          .select('id')
          .eq('user_id', editingTx.user_id)
          .limit(1);

        if (invs && invs.length > 0) {
          await supabase
            .from('invitations')
            .update({ expired_at: expiredAtISO })
            .eq('id', invs[0].id);
        }
      }

      setTransactions(prev => prev.map(t => 
        t.id === editingTx.id 
          ? { 
              ...t, 
              payment_status: editingTxStatus,
              amount: Number(editingTxAmount),
              activated_at: activatedAtISO || undefined,
              expired_at: expiredAtISO || undefined
            } 
          : t
      ));

      alert('Transaksi berhasil diperbarui!');
      setEditingTx(null);
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      alert(`Gagal memperbarui transaksi: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Pending Transaction (Customer Action)
  const handleCreateTransaction = async (pkg: Package) => {
    if (!profile) return;
    try {
      setActionLoading(true);

      const isEligibleForPromo = appliedPromo && pkg.price >= Number(appliedPromo.min_transaction);
      const discountAmount = isEligibleForPromo ? getDiscountAmount(pkg.price) : 0;
      const finalAmount = isEligibleForPromo ? getDiscountedPrice(pkg.price) : pkg.price;
      const promoCodeUsed = isEligibleForPromo ? appliedPromo.code : null;
      
      // Supabase base insert payload
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          package_id: pkg.id,
          original_amount: pkg.price,
          amount: finalAmount,
          promo_code: promoCodeUsed,
          discount_amount: discountAmount,
          payment_status: 'pending',
          proof_url: '',
        })
        .select()
        .single();

      if (error) throw error;

      // If promo code was used, increment usage count in public.promos
      if (isEligibleForPromo) {
        await supabase
          .from('promos')
          .update({ usage_count: appliedPromo.usage_count + 1 })
          .eq('id', appliedPromo.id);
      }
      
      // Update local transaction state
      setTransactions(prev => [data as Transaction, ...prev]);
      alert(`Transaksi Pemesanan ${pkg.name} Berhasil Dibuat!\nSilakan lakukan transfer senilai Rp ${finalAmount.toLocaleString('id-ID')} lalu unggah bukti transfer pembayaran di baris transaksi baru Anda.`);
      setShowPurchaseModal(false);

      // Reset promo state
      setPromoCode('');
      setAppliedPromo(null);
      setPromoSuccess(null);
      setPromoError(null);
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      alert(`Gagal membuat transaksi: ${err.message || 'database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Helpers to resolve package names
  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Tema Kustom Premium';
  };

  // Filter & Search Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          getPackageName(t.package_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status custom resolving
    let statusCategory = t.payment_status;
    if (t.payment_status === 'pending') {
      statusCategory = t.proof_url ? 'verifying' : 'unpaid';
    }

    const matchesStatus = filterStatus === 'all' || statusCategory === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Math Analytics
  const stats = {
    revenue: transactions
      .filter(t => t.payment_status === 'success')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    successCount: transactions.filter(t => t.payment_status === 'success').length,
    pendingVerification: transactions.filter(t => t.payment_status === 'pending' && t.proof_url).length,
    unpaidCount: transactions.filter(t => t.payment_status === 'pending' && !t.proof_url).length,
  };

  const pendingUnpaidTx = profile?.role === 'customer' 
    ? transactions.find(t => t.payment_status === 'pending' && !t.proof_url)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transaksi & Pembelian</h1>
          <p className="text-gray-500 text-sm">
            {profile?.role === 'super_admin'
              ? 'Kelola transaksi pembelian paket desain undangan, verifikasi bukti transfer, dan berikan otorisasi aktif.'
              : 'Pantau riwayat pemesanan paket digital Anda, unduh faktur, dan unggah bukti transfer pembayaran.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {profile?.role === 'customer' && (
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-primary-50"
            >
              <Plus className="w-4 h-4" /> Beli Paket Baru
            </button>
          )}
          <button
            onClick={loadData}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Riwayat
          </button>
        </div>
      </div>

      {/* Tab Navigation for Admin */}
      {profile?.role === 'super_admin' && (
        <div className="flex border-b border-gray-200 gap-4 mb-2">
          <button
            onClick={() => setAdminActiveTab('transactions')}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all ${
              adminActiveTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            📋 Riwayat Transaksi Sistem
          </button>
          <button
            onClick={() => setAdminActiveTab('promos')}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all ${
              adminActiveTab === 'promos'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            🎟️ Kelola Kode Promo & Diskon
          </button>
        </div>
      )}

      {profile?.role === 'super_admin' && adminActiveTab === 'promos' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-left">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Kelola Kode Promo</h3>
                <p className="text-xs text-gray-500 mt-0.5">Buat, aktifkan, atau nonaktifkan kode diskon untuk kustomer.</p>
              </div>
              <button
                onClick={() => setShowPromoModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-primary-50"
              >
                <Plus className="w-4 h-4" /> Buat Kode Promo Baru
              </button>
            </div>

            {loadingPromos ? (
              <div className="p-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400 font-semibold">Memuat daftar kode promo...</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-2xl">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-gray-700">Belum ada kode promo ditemukan</p>
                <p className="text-xs text-gray-400 mt-0.5">Buat kode promo pertama Anda untuk dibagikan kepada kustomer.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-4 pl-6">Kode Promo</th>
                      <th className="p-4">Tipe Diskon</th>
                      <th className="p-4">Nilai Potongan</th>
                      <th className="p-4">Min. Belanja</th>
                      <th className="p-4">Kuota / Pemakaian</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Kedaluwarsa</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {promos.filter(p => p && p.id).map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pl-6 font-bold text-sm text-gray-950 font-mono tracking-wider uppercase">
                          {p.code}
                        </td>
                        <td className="p-4 capitalize">
                          {p.discount_type === 'percentage' ? 'Persentase (%)' : 'Potongan Tetap (Rp)'}
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {p.discount_type === 'percentage' ? `${p.discount_value}%` : `Rp ${Number(p.discount_value).toLocaleString('id-ID')}`}
                        </td>
                        <td className="p-4">
                          Rp {Number(p.min_transaction).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-gray-700">
                            {p.usage_count}
                          </span>
                          <span className="text-gray-400"> / </span>
                          <span className="font-mono text-gray-700">
                            {p.usage_limit !== null ? p.usage_limit : '∞'}
                          </span>
                        </td>
                        <td className="p-4">
                          {p.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-550 border border-gray-200">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-400 font-medium">
                          {p.expired_at ? (
                            new Date(p.expired_at) < new Date() ? (
                              <span className="text-red-500 font-semibold">Expired</span>
                            ) : (
                              new Date(p.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                            )
                          ) : (
                            <span className="text-gray-300 italic font-normal">No Limit</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            onClick={() => handleTogglePromoStatus(p)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                              p.status === 'active'
                                ? 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 border-green-150 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => handleDeletePromo(p.id, p.code)}
                            className="text-red-600 hover:text-red-700 p-1.5 rounded-lg border border-transparent hover:border-red-150 hover:bg-red-50 transition inline-flex items-center justify-center align-middle"
                            title="Hapus Promo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue/Spending */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              {profile?.role === 'super_admin' ? 'Total Pemasukan (Lunas)' : 'Total Pengeluaran'}
            </span>
            <span className="text-lg font-extrabold text-gray-800 block mt-0.5">
              Rp {stats.revenue.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Card 2: Confirmed Success Purchases */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3.5 bg-emerald-50/10">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Pemesanan Lunas</span>
            <span className="text-lg font-extrabold text-emerald-800 block mt-0.5">{stats.successCount} <span className="text-xs font-semibold text-emerald-500">transaksi</span></span>
          </div>
        </div>

        {/* Card 3: Pending Verification Proofs */}
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex items-center gap-3.5 bg-amber-50/10">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Verifikasi</span>
            <span className="text-lg font-extrabold text-amber-800 block mt-0.5">{stats.pendingVerification} <span className="text-xs font-semibold text-amber-500">transaksi</span></span>
          </div>
        </div>

        {/* Card 4: Unpaid / Empty Proofs */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Belum Dibayar</span>
            <span className="text-lg font-extrabold text-gray-800 block mt-0.5">{stats.unpaidCount} <span className="text-xs font-semibold text-gray-400">transaksi</span></span>
          </div>
        </div>
      </div>

      {/* 2.5. Pending Payment Highlight Card (Customer Only) */}
      {pendingUnpaidTx && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-250 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-stretch animate-in fade-in duration-300">
          {/* Left panel: Info & Amount */}
          <div className="flex-1 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" /> Menunggu Pembayaran
              </span>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Selesaikan Pembayaran Anda</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Anda memiliki pesanan paket <strong className="text-gray-800">{getPackageName(pendingUnpaidTx.package_id)}</strong> yang belum dibayar. Silakan lakukan transfer sebelum halaman ini kedaluwarsa.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-amber-150 p-4 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Tagihan</span>
              <span className="text-3xl font-black text-amber-700 block mt-1">
                Rp {pendingUnpaidTx.amount?.toLocaleString('id-ID')}
              </span>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-mono">
                <span>ID Transaksi:</span>
                <span className="font-bold text-gray-600">{pendingUnpaidTx.id}</span>
              </div>
            </div>
          </div>

          {/* Middle panel: Bank Transfer Accounts */}
          <div className="flex-1 space-y-4">
            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" /> Pilihan Rekening Tujuan Transfer:
            </h4>

            <div className="grid gap-3.5">
              {/* BCA Account */}
              <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-300 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-xs shrink-0 select-none border border-blue-150 shadow-inner">
                    BCA
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Bank BCA</span>
                    <span className="text-sm font-extrabold text-gray-800 block mt-0.5">8012345678</span>
                    <span className="text-[10px] text-gray-400 block font-medium">a.n. PT NikahYuk Indonesia</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount('8012345678')}
                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                    copiedAccount === '8012345678'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 group-hover:scale-105 active:scale-95'
                  }`}
                  title="Salin Rekening"
                >
                  {copiedAccount === '8012345678' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* GoPay/Dana */}
              <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-300 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-xs shrink-0 select-none border border-emerald-150 shadow-inner">
                    GoPay
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">E-Wallet GoPay/Dana</span>
                    <span className="text-sm font-extrabold text-gray-800 block mt-0.5">081234567890</span>
                    <span className="text-[10px] text-gray-400 block font-medium">a.n. NikahYuk Payment</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount('081234567890')}
                  className={`p-2 rounded-xl border transition flex items-center justify-center ${
                    copiedAccount === '081234567890'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 group-hover:scale-105 active:scale-95'
                  }`}
                  title="Salin Nomor HP"
                >
                  {copiedAccount === '081234567890' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Upload box */}
          <div className="flex-1 bg-white border border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-gray-800 text-sm">Sudah Melakukan Transfer?</h5>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed font-medium">
              Unggah file pratinjau struk transfer (JPG, JPEG, atau PNG) untuk divalidasi langsung oleh Admin kami dalam waktu 5-10 menit.
            </p>
            <button
              type="button"
              onClick={() => triggerUploadForPending(pendingUnpaidTx.id)}
              disabled={actionLoading}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-amber-100 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Unggah Bukti Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Main Grid and Data List Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan ID Transaksi atau nama paket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full bg-white transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium shadow-sm cursor-pointer"
            >
              <option value="all">Semua Status Transaksi</option>
              <option value="success">✅ Lunas / Sukses</option>
              <option value="verifying">⏳ Menunggu Verifikasi</option>
              <option value="unpaid">🪙 Belum Dibayar</option>
              <option value="failed">❌ Gagal / Ditolak</option>
            </select>
          </div>
        </div>

        {/* List table */}
        {loading ? (
          <div className="p-16 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
            <p className="text-xs text-gray-400 font-semibold">Memuat riwayat transaksi digital...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-b-2xl m-5">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
            <p className="text-sm font-bold text-gray-700">Belum ada transaksi ditemukan</p>
            <p className="text-xs text-gray-400 mt-0.5">Seluruh pemesanan dan langganan paket undangan kustomer akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-4 pl-6">ID Transaksi</th>
                  <th className="p-4">Paket Desain</th>
                  <th className="p-4">Jumlah Pembayaran</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Bukti Bayar</th>
                  <th className="p-4">Tanggal Pesan</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => {
                  const hasProof = !!tx.proof_url;
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                      {/* Copyable ID */}
                      <td className="p-4 pl-6 font-mono text-[11px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-700">{tx.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => handleCopyId(tx.id)}
                            className="text-gray-300 hover:text-primary-500 transition p-0.5 rounded"
                            title="Salin ID Lengkap"
                          >
                            {copiedId === tx.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Package Name */}
                      <td className="p-4 font-bold text-gray-950 text-sm">
                        <div>{getPackageName(tx.package_id)}</div>
                        {tx.promo_code && (
                          <div className="mt-1 border-t border-transparent">
                            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-750 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-blue-150 uppercase tracking-wide">
                              🎟️ {tx.promo_code}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-extrabold text-gray-850">
                        <div>Rp {tx.amount?.toLocaleString('id-ID')}</div>
                        {tx.discount_amount && tx.discount_amount > 0 ? (
                          <div className="text-[10px] text-gray-400 line-through font-normal mt-0.5">
                            Rp {tx.original_amount?.toLocaleString('id-ID')}
                          </div>
                        ) : null}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        {tx.payment_status === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                            <CheckCircle className="w-3 h-3" /> Lunas
                          </span>
                        )}
                        {tx.payment_status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-150">
                            <XCircle className="w-3 h-3" /> Gagal / Ditolak
                          </span>
                        )}
                        {tx.payment_status === 'pending' && (
                          hasProof ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
                              <Clock className="w-3 h-3 animate-pulse" /> Verifikasi Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                              <AlertCircle className="w-3 h-3" /> Belum Bayar
                            </span>
                          )
                        )}
                      </td>

                      {/* Payment Proof indicator */}
                      <td className="p-4">
                        {hasProof ? (
                          <button
                            onClick={() => setViewingProofUrl(tx.proof_url)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 transition flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-gray-350 italic">Belum diunggah</span>
                        )}
                      </td>

                      {/* Created at date */}
                      <td className="p-4 text-gray-400 font-medium">
                        {new Date(tx.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        {profile?.role === 'super_admin' ? (
                          <div className="flex justify-end gap-1.5">
                            {tx.payment_status === 'pending' && hasProof && (
                              <>
                                <button
                                  onClick={() => handleApproveTransaction(tx.id)}
                                  disabled={actionLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                                  title="Setujui Pembayaran"
                                >
                                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => handleRejectTransaction(tx.id)}
                                  disabled={actionLoading}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                                  title="Tolak Pembayaran"
                                >
                                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => openEditTxModal(tx)}
                              disabled={actionLoading}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xs border border-blue-200 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                              title="Sunting Transaksi"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Sunting</span>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              disabled={actionLoading}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xs border border-red-200 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        ) : (
                          // Customer action logic
                          tx.payment_status === 'pending' ? (
                            <button
                              onClick={() => {
                                setUploadingTxId(tx.id);
                                setTimeout(() => fileInputRef.current?.click(), 100);
                              }}
                              disabled={actionLoading}
                              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <Upload className="w-3 h-3" /> Unggah Bukti
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">-</span>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Hidden File input for customer upload receipt proof */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/webp"
        onChange={handleUploadProof}
        className="hidden"
      />

      {/* Modal 1: Image Proof Viewer for Admin */}
      {viewingProofUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 text-sm">Pratinjau Bukti Transfer Pembayaran</h4>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
              >
                Tutup
              </button>
            </div>
            <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden border border-gray-150 relative">
              <img
                src={viewingProofUrl}
                alt="Bukti Transfer Pembayaran"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.open(viewingProofUrl, '_blank')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl border flex items-center gap-1 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
              </button>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Beli Paket Baru Modal for Customer */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Pilih Paket Undangan Digital Baru</h4>
                <p className="text-xs text-gray-500">Pilih salah satu paket di bawah untuk langsung mengaktifkan fitur di dasbor Anda.</p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition animate-in duration-200"
              >
                Tutup
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const hasValidPromo = appliedPromo && pkg.price >= Number(appliedPromo.min_transaction);
                return (
                  <div key={pkg.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:border-primary-400 hover:shadow-md transition shadow-sm">
                    <div className="space-y-3">
                      <h5 className="font-bold text-gray-800 text-sm">{pkg.name}</h5>
                      <div className="text-2xl font-extrabold text-gray-950 text-left">
                        {hasValidPromo ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through font-normal">
                              Rp {pkg.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-emerald-600">
                              Rp {getDiscountedPrice(pkg.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <span>Rp {pkg.price.toLocaleString('id-ID')}</span>
                        )}
                      </div>
                      <ul className="text-[11px] text-gray-500 space-y-1.5 font-medium border-t pt-3 border-gray-205 text-left">
                        <li>• Masa Aktif: {Math.round(pkg.active_period / 30)} Bulan</li>
                        <li>• Kuota Tamu: {pkg.price === 49000 ? '150 Kontak' : pkg.price === 99000 ? '500 Kontak' : 'Tanpa Batas (Unlimited)'}</li>
                        <li>• Galeri Foto: {pkg.price === 49000 ? 'Maks 3 Foto' : pkg.price === 99000 ? 'Maks 8 Foto' : 'Maks 12 Foto'}</li>
                        <li>• Lagu BGM: {pkg.price === 49000 ? 'BGM Standar' : 'BGM Kustom (Unggah MP3)'}</li>
                        <li>• E-Gift & Kado: {pkg.price === 49000 ? 'Terkunci' : 'Aktif Lengkap'}</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleCreateTransaction(pkg)}
                      disabled={actionLoading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm mt-5 disabled:opacity-50"
                    >
                      {actionLoading ? 'Memproses...' : (
                        hasValidPromo ? (
                          <span>Pesan Rp {getDiscountedPrice(pkg.price).toLocaleString('id-ID')}</span>
                        ) : (
                          <span>Pesan Paket Ini</span>
                        )
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Input Block */}
            <div className="bg-slate-50 rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-gray-700 block">🏷️ Punya Kode Promo / Voucher Diskon?</span>
                <span className="text-[10px] text-gray-400 block leading-normal font-medium">
                  Masukkan kode diskon Anda di sini untuk langsung mendapatkan potongan harga spesial NikahYuk!
                </span>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="CONTOH: PROMO99"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={checkingPromo || !!appliedPromo}
                    className="px-4 py-2 text-xs border border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none w-44 font-bold tracking-wider bg-white uppercase disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {appliedPromo && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoSuccess(null);
                        setPromoCode('');
                      }}
                      className="absolute right-2.5 top-2 text-[10px] font-extrabold text-red-500 hover:text-red-750"
                    >
                      Batal
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={checkingPromo || !!appliedPromo || !promoCode}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {checkingPromo ? 'Memeriksa...' : 'Terapkan'}
                </button>
              </div>
            </div>

            {promoError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex gap-2 text-xs text-left">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold">{promoError}</span>
              </div>
            )}

            {promoSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex gap-2 text-xs text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold">{promoSuccess}</span>
              </div>
            )}
            
            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Admin Promo Creation Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreatePromo}
            className="relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border p-6 space-y-4 text-left"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-extrabold text-gray-900 text-sm">Buat Kode Promo Baru</h4>
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kode Voucher (Kapital, Tanpa Spasi)</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: PROMOBAHAGIA"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tipe Potongan</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Rupiah Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Jumlah Potongan</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min. Belanja (Rp)</label>
                  <input 
                    type="number"
                    required
                    min={0}
                    value={newPromoMinTx}
                    onChange={(e) => setNewPromoMinTx(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batas Kuota (Kosongkan = ∞)</label>
                  <input 
                    type="number"
                    placeholder="Unlimited"
                    value={newPromoLimit}
                    onChange={(e) => setNewPromoLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tanggal Kedaluwarsa (Opsional)</label>
                <input 
                  type="date"
                  value={newPromoExpiry}
                  onChange={(e) => setNewPromoExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-primary-50 disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Buat Kupon Promo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 4: Admin Transaction Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-primary-500" /> Sunting Transaksi Kustomer
              </h4>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-2xl border text-stone-600 space-y-1.5 font-medium">
                <div><span className="font-bold text-gray-700">ID Transaksi:</span> <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border select-all">{editingTx.id}</span></div>
                <div><span className="font-bold text-gray-700">Pelanggan ID:</span> <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border select-all">{editingTx.user_id}</span></div>
                <div><span className="font-bold text-gray-700">Paket:</span> <span className="font-extrabold text-gray-900">{getPackageName(editingTx.package_id)}</span></div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Pembayaran</label>
                <select
                  value={editingTxStatus}
                  onChange={(e) => setEditingTxStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold bg-white cursor-pointer"
                >
                  <option value="pending">⏳ Pending (Menunggu Verifikasi/Belum Bayar)</option>
                  <option value="success">✅ Success (Lunas & Aktifkan Paket)</option>
                  <option value="failed">❌ Failed (Ditolak / Gagal)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Jumlah Pembayaran (Rp)</label>
                <input 
                  type="number"
                  required
                  min={0}
                  value={editingTxAmount}
                  onChange={(e) => setEditingTxAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Waktu Aktivasi</label>
                  <input 
                    type="datetime-local"
                    value={editingTxActivatedAt}
                    onChange={(e) => setEditingTxActivatedAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Waktu Kedaluwarsa</label>
                  <input 
                    type="datetime-local"
                    value={editingTxExpiredAt}
                    onChange={(e) => setEditingTxExpiredAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateTransaction}
                disabled={actionLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-primary-50 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
