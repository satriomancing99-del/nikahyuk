import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { supabase } from '../../../lib/supabase';
import { useTransactions } from './hooks/useTransactions';
import { usePromos } from './hooks/usePromos';
import { Transaction, Package } from '../../../types/database.types';
import { TransactionsFilterRow } from './components/TransactionsFilterRow';
import { TransactionsTable } from './components/TransactionsTable';
import { ReceiptModal } from './components/ReceiptModal';
import { PurchaseModal } from './components/PurchaseModal';
import { PromoModal } from './components/PromoModal';
import { EditTxModal } from './components/EditTxModal';
import { PromoListTable } from './components/PromoListTable';
import { BankDetailsCard } from './components/BankDetailsCard';

export default function TransactionsManager() {
  const { profile } = useAuthStore();
  const {
    transactions, setTransactions, packages, loading, actionLoading, setActionLoading,
    loadData, handleUploadProof, handleApproveTransaction, handleRejectTransaction, handleDeleteTransaction
  } = useTransactions();

  const promosHook = usePromos();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadingTxId, setUploadingTxId] = useState<string | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'transactions' | 'promos'>('transactions');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Admin Editing Transaction states
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingTxStatus, setEditingTxStatus] = useState<string>('pending');
  const [editingTxAmount, setEditingTxAmount] = useState<number>(0);
  const [editingTxActivatedAt, setEditingTxActivatedAt] = useState<string>('');
  const [editingTxExpiredAt, setEditingTxExpiredAt] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Tema Kustom Premium';
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const triggerUploadProof = (txId: string) => {
    setUploadingTxId(txId);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingTxId) {
      handleUploadProof(uploadingTxId, file);
    }
  };

  const openEditTxModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditingTxStatus(tx.payment_status);
    setEditingTxAmount(Number(tx.amount) || 0);
    setEditingTxActivatedAt(tx.activated_at ? tx.activated_at.substring(0, 16) : '');
    setEditingTxExpiredAt(tx.expired_at ? tx.expired_at.substring(0, 16) : '');
  };

  // Sync promos count when active tab changes
  useEffect(() => {
    if (profile?.role === 'super_admin' && adminActiveTab === 'promos') {
      promosHook.loadPromos();
    }
  }, [adminActiveTab, profile]);

  const stats = {
    revenue: transactions.filter(t => t.payment_status === 'success').reduce((sum, t) => sum + (t.amount || 0), 0),
    successCount: transactions.filter(t => t.payment_status === 'success').length,
    pendingVerification: transactions.filter(t => t.payment_status === 'pending' && t.proof_url).length,
    unpaidCount: transactions.filter(t => t.payment_status === 'pending' && !t.proof_url).length,
  };

  const pendingUnpaidTx = profile?.role === 'customer' 
    ? transactions.find(t => t.payment_status === 'pending' && !t.proof_url)
    : null;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || getPackageName(t.package_id).toLowerCase().includes(searchQuery.toLowerCase());
    let statusCategory = t.payment_status;
    if (t.payment_status === 'pending') {
      statusCategory = t.proof_url ? 'verifying' : 'unpaid';
    }
    const matchesStatus = filterStatus === 'all' || statusCategory === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Riwayat Transaksi & Pembelian</h1>
          <p className="text-gray-550 text-sm">
            {profile?.role === 'super_admin' ? 'Kelola transaksi pembelian paket desain undangan, verifikasi bukti transfer, dan berikan otorisasi aktif.' : 'Pantau riwayat pemesanan paket digital Anda, unduh faktur, dan unggah bukti transfer pembayaran.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          {profile?.role === 'customer' && (
            <button onClick={() => setShowPurchaseModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-primary-50">
              <Plus className="w-4 h-4" /> Beli Paket Baru
            </button>
          )}
          <button onClick={loadData} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Riwayat
          </button>
        </div>
      </div>

      {profile?.role === 'super_admin' && (
        <div className="flex border-b border-gray-200 gap-4 mb-2">
          <button onClick={() => setAdminActiveTab('transactions')} className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all ${adminActiveTab === 'transactions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            📋 Riwayat Transaksi Sistem
          </button>
          <button onClick={() => setAdminActiveTab('promos')} className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all ${adminActiveTab === 'promos' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            🎟️ Kelola Kode Promo & Diskon
          </button>
        </div>
      )}

      {profile?.role === 'super_admin' && adminActiveTab === 'promos' ? (
        <PromoListTable promos={promosHook.promos} loading={promosHook.loadingPromos} actionLoading={promosHook.actionLoading} handleTogglePromoStatus={promosHook.handleTogglePromoStatus} handleDeletePromo={promosHook.handleDeletePromo} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0"><CreditCard className="w-5.5 h-5.5" /></div>
              <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{profile?.role === 'super_admin' ? 'Total Pemasukan (Lunas)' : 'Total Pengeluaran'}</span><span className="text-lg font-extrabold text-gray-850 block mt-0.5">Rp {stats.revenue.toLocaleString('id-ID')}</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3.5 bg-emerald-50/10">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5.5 h-5.5" /></div>
              <div><span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Pemesanan Lunas</span><span className="text-lg font-extrabold text-emerald-800 block mt-0.5">{stats.successCount} <span className="text-xs font-semibold text-emerald-500">transaksi</span></span></div>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex items-center gap-3.5 bg-amber-50/10">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0"><Clock className="w-5.5 h-5.5" /></div>
              <div><span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Verifikasi</span><span className="text-lg font-extrabold text-amber-800 block mt-0.5">{stats.pendingVerification} <span className="text-xs font-semibold text-amber-500">transaksi</span></span></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-5.5 h-5.5" /></div>
              <div><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Belum Dibayar</span><span className="text-lg font-extrabold text-gray-850 block mt-0.5">{stats.unpaidCount} <span className="text-xs font-semibold text-gray-400">transaksi</span></span></div>
            </div>
          </div>

          {pendingUnpaidTx && (
            <BankDetailsCard pendingUnpaidTx={pendingUnpaidTx} getPackageName={getPackageName} triggerUploadProof={triggerUploadProof} actionLoading={actionLoading} />
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <TransactionsFilterRow searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
            <TransactionsTable transactions={filteredTransactions} loading={loading} actionLoading={actionLoading} packages={packages} role={profile?.role || 'customer'} copiedId={copiedId} handleCopyId={handleCopyId} setViewingProofUrl={setViewingProofUrl} handleApproveTransaction={handleApproveTransaction} handleRejectTransaction={handleRejectTransaction} openEditTxModal={openEditTxModal} handleDeleteTransaction={handleDeleteTransaction} triggerUploadProof={triggerUploadProof} />
          </div>
        </>
      )}

      <input type="file" ref={fileInputRef} accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="hidden" />

      <ReceiptModal viewingProofUrl={viewingProofUrl} onClose={() => setViewingProofUrl(null)} />
      
      <PurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} packages={packages} handleCreateTransaction={(pkg) => {
        const isEligibleForPromo = promosHook.appliedPromo && pkg.price >= Number(promosHook.appliedPromo.min_transaction);
        const discountAmount = isEligibleForPromo ? promosHook.getDiscountAmount(pkg.price) : 0;
        const finalAmount = isEligibleForPromo ? promosHook.getDiscountedPrice(pkg.price) : pkg.price;
        const promoCodeUsed = isEligibleForPromo ? promosHook.appliedPromo.code : null;
        
        const isFree = finalAmount === 0;
        const activePeriodDays = pkg.active_period || 365;
        const expiredAt = isFree ? new Date() : null;
        if (isFree && expiredAt) expiredAt.setDate(expiredAt.getDate() + activePeriodDays);

        Promise.resolve(supabase.from('transactions').insert({
          user_id: profile?.id, package_id: pkg.id, original_amount: pkg.price, amount: finalAmount, promo_code: promoCodeUsed, discount_amount: discountAmount,
          payment_status: isFree ? 'success' : 'pending', proof_url: '', activated_at: isFree ? new Date().toISOString() : null, expired_at: expiredAt ? expiredAt.toISOString() : null
        }).select().single()).then(({ data, error }) => {
          if (error) throw error;
          if (isEligibleForPromo) supabase.from('promos').update({ usage_count: promosHook.appliedPromo.usage_count + 1 }).eq('id', promosHook.appliedPromo.id).then(() => {});
          if (isFree && expiredAt) {
            supabase.from('profiles').update({ active_package_id: pkg.id, package_expired_at: expiredAt.toISOString(), updated_at: new Date().toISOString() }).eq('id', profile?.id).then(() => {});
            supabase.from('invitations').select('id').eq('user_id', profile?.id).order('created_at', { ascending: false }).limit(1).then(({ data: invs }) => {
              if (invs && invs.length > 0) supabase.from('invitations').update({ expired_at: expiredAt.toISOString(), updated_at: new Date().toISOString() }).eq('id', invs[0].id).then(() => {});
            });
          }
          setTransactions(prev => [data as Transaction, ...prev]);
          alert(isFree ? `Transaksi Berhasil Aktif!` : `Transaksi Berhasil! Silakan transfer Rp ${finalAmount.toLocaleString('id-ID')} dan upload bukti.`);
          setShowPurchaseModal(false);
          promosHook.setPromoCode('');
          promosHook.setAppliedPromo(null);
          promosHook.setPromoSuccess(null);
          promosHook.setPromoError(null);
        }).catch(err => {
          console.error(err);
          alert(`Gagal: ${err.message}`);
        });
      }} actionLoading={actionLoading} promoCode={promosHook.promoCode} setPromoCode={promosHook.setPromoCode} checkingPromo={promosHook.checkingPromo} handleApplyPromo={promosHook.handleApplyPromo} appliedPromo={promosHook.appliedPromo} setAppliedPromo={promosHook.setAppliedPromo} promoError={promosHook.promoError} setPromoError={promosHook.setPromoError} promoSuccess={promosHook.promoSuccess} setPromoSuccess={promosHook.setPromoSuccess} getDiscountedPrice={promosHook.getDiscountedPrice} />

      <PromoModal isOpen={promosHook.showPromoModal} onClose={() => promosHook.setShowPromoModal(false)} onSubmit={promosHook.handleCreatePromo} actionLoading={promosHook.actionLoading} code={promosHook.newPromoCode} setCode={promosHook.setNewPromoCode} discountType={promosHook.newPromoType} setDiscountType={promosHook.setNewPromoType} discountValue={promosHook.newPromoValue} setDiscountValue={promosHook.setNewPromoValue} minTx={promosHook.newPromoMinTx} setMinTx={promosHook.setNewPromoMinTx} usageLimit={promosHook.newPromoLimit} setUsageLimit={promosHook.setNewPromoLimit} expiry={promosHook.newPromoExpiry} setExpiry={promosHook.setNewPromoExpiry} />

      <EditTxModal editingTx={editingTx} onClose={() => setEditingTx(null)} status={editingTxStatus} setStatus={setEditingTxStatus} amount={editingTxAmount} setAmount={setEditingTxAmount} activatedAt={editingTxActivatedAt} setActivatedAt={setEditingTxActivatedAt} expiredAt={editingTxExpiredAt} setExpiredAt={setEditingTxExpiredAt} getPackageName={getPackageName} actionLoading={actionLoading} onSubmit={() => {
        if (!editingTx) return;
        setActionLoading(true);
        const activatedAtISO = editingTxActivatedAt ? new Date(editingTxActivatedAt).toISOString() : null;
        const expiredAtISO = editingTxExpiredAt ? new Date(editingTxExpiredAt).toISOString() : null;
        Promise.resolve(supabase.from('transactions').update({ payment_status: editingTxStatus, amount: Number(editingTxAmount), activated_at: activatedAtISO, expired_at: expiredAtISO }).eq('id', editingTx.id)).then(({ error }) => {
          if (error) throw error;
          if (editingTxStatus === 'success' && expiredAtISO) {
            supabase.from('invitations').select('id').eq('user_id', editingTx.user_id).limit(1).then(({ data: invs }) => {
              if (invs && invs.length > 0) supabase.from('invitations').update({ expired_at: expiredAtISO }).eq('id', invs[0].id).then(() => {});
            });
          }
          setTransactions(prev => prev.map(t => t.id === editingTx.id ? { ...t, payment_status: editingTxStatus, amount: Number(editingTxAmount), activated_at: activatedAtISO || undefined, expired_at: expiredAtISO || undefined } : t));
          alert('Transaksi diperbarui!');
          setEditingTx(null);
        }).catch(err => alert(`Gagal: ${err.message}`)).finally(() => setActionLoading(false));
      }} />
    </div>
  );
}
