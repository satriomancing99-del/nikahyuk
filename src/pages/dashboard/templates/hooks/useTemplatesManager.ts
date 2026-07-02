import { useState, useEffect } from 'react';
import { templateService } from '../../../../services';
import { Template } from '../../../../types/database.types';
import { useAuthStore } from '../../../../stores/authStore';

export const useTemplatesManager = () => {
  const { profile, user } = useAuthStore();
  const [existingTemplates, setExistingTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPackage, setSelectedPackage] = useState<string>('All');

  // Saving state
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Metadata Modal state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState(0);
  const [editingCategory, setEditingCategory] = useState('');
  const [editingStatus, setEditingStatus] = useState('active');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const list = await templateService.getAll();
      setExistingTemplates(list || []);
    } catch (err) {
      console.error('Error fetching database templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborationSetting = async () => {
    try {
      const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
      const rows = await cloudflareApi.getTableRows<any>('system_settings', { key: 'collaboration_enabled' });
      if (rows && rows.length > 0) {
        const valObj = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
        setCollaborationEnabled(!!valObj?.enabled);
      }
    } catch (err) {
      console.error('Error fetching collaboration setting:', err);
    }
  };

  const handleToggleCollaboration = async () => {
    const nextVal = !collaborationEnabled;
    try {
      const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
      const rows = await cloudflareApi.getTableRows<any>('system_settings', { key: 'collaboration_enabled' });
      const payload = {
        key: 'collaboration_enabled',
        value: JSON.stringify({ enabled: nextVal }),
        updated_at: new Date().toISOString()
      };
      
      if (rows && rows.length > 0) {
        await cloudflareApi.updateTableRow('system_settings', 'collaboration_enabled', payload);
      } else {
        await cloudflareApi.createTableRow('system_settings', payload);
      }
      setCollaborationEnabled(nextVal);
      alert(`Akses kontribusi kustomer berhasil ${nextVal ? 'DIBUKA' : 'DITUTUP'}!`);
    } catch (err) {
      console.error('Error toggling collaboration setting:', err);
      alert('Gagal memperbarui status kolaborasi.');
    }
  };

  const handleToggleStatus = async (tpl: Template) => {
    const nextStatus = tpl.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await templateService.update(tpl.id, { status: nextStatus });
      setExistingTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      console.error('Error toggling template status:', err);
      alert('Gagal memperbarui status template.');
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus template "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      setSaving(true);
      await templateService.delete(id);
      setExistingTemplates(prev => prev.filter(t => t.id !== id));
      setSuccessMsg(`Template "${name}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(`Gagal menghapus template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (tpl: Template) => {
    setEditingTemplate(tpl);
    setEditingName(tpl.name);
    setEditingPrice(tpl.price);
    setEditingCategory(tpl.category);
    setEditingStatus(tpl.status);
  };

  const closeEditModal = () => {
    setEditingTemplate(null);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      const updated = await templateService.update(editingTemplate.id, {
        name: editingName,
        price: Number(editingPrice),
        category: editingCategory,
        status: editingStatus
      });
      setExistingTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditingTemplate(null);
      setSuccessMsg(`Template "${updated.name}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error updating template:', err);
      alert(`Gagal memperbarui template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveDraftToDatabase = async (draftTemplate: Partial<Template>, thumbnailFile?: File | null) => {
    if (!draftTemplate || !draftTemplate.name) return;
    try {
      setSaving(true);
      setSuccessMsg(null);

      let finalSlug = draftTemplate.slug || 'template-slug';
      finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      let finalThumbnailUrl = draftTemplate.thumbnail_url || '';
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop()?.toLowerCase() || 'png';
        const filePath = `templates/${finalSlug}/thumbnail_${Date.now()}.${fileExt}`;
        const { storageService } = await import('../../../../services');
        finalThumbnailUrl = await storageService.uploadFile(thumbnailFile, 'template-thumbnails', filePath);
      }

      const payload: any = {
        name: draftTemplate.name,
        slug: finalSlug,
        category: draftTemplate.category || 'Classic',
        price: draftTemplate.price || 150000,
        thumbnail_url: finalThumbnailUrl,
        preview_url: draftTemplate.preview_url || `/preview/${finalSlug}`,
        status: profile?.role === 'customer' ? 'inactive' : (draftTemplate.status === 'draft' ? 'inactive' : (draftTemplate.status || 'active')),
        jsx_code: draftTemplate.jsx_code || null
      };

      if (profile?.role === 'customer' && user?.id) {
        payload.created_by = user.id;
      }

      const templates = await templateService.getAll({ slug: finalSlug });
      const existingTemplate = templates && templates.length > 0 ? templates[0] : null;

      let isUpdate = false;
      if (existingTemplate) {
        const isOwner = user?.id && existingTemplate.created_by === user.id;
        const isAdmin = profile?.role === 'super_admin';

        if (isAdmin || isOwner) {
          await templateService.update(existingTemplate.id, payload);
          isUpdate = true;
        } else {
          throw new Error('Slug template ini sudah terdaftar oleh pengguna lain. Silakan ganti "Custom Slug" Anda.');
        }
      } else {
        await templateService.create(payload);
      }

      const msg = profile?.role === 'customer'
        ? (isUpdate ? `Template "${payload.name}" berhasil diperbarui.` : `Selamat! Template "${payload.name}" berhasil diajukan untuk ditinjau oleh Admin.`)
        : (isUpdate ? `Template "${payload.name}" berhasil diperbarui di database.` : `Template "${payload.name}" berhasil diunggah dan disimpan ke database.`);

      setSuccessMsg(msg);
      await loadTemplates();
      setTimeout(() => setSuccessMsg(null), 4000);
      return true;
    } catch (err: any) {
      console.error('Save to database error:', err);
      alert(`Gagal menyimpan template ke database: ${err.message || 'Error tidak diketahui'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    fetchCollaborationSetting();
  }, []);

  return {
    profile,
    user,
    existingTemplates,
    loading,
    collaborationEnabled,
    searchQuery,
    selectedCategory,
    selectedPackage,
    saving,
    successMsg,
    editingTemplate,
    editingName,
    editingPrice,
    editingCategory,
    editingStatus,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPackage,
    setEditingName,
    setEditingPrice,
    setEditingCategory,
    setEditingStatus,
    loadTemplates,
    handleToggleCollaboration,
    handleToggleStatus,
    handleDeleteTemplate,
    openEditModal,
    closeEditModal,
    handleUpdateTemplate,
    saveDraftToDatabase,
  };
};
