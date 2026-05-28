import { supabase } from '../lib/supabase';
import { templateService, invitationService, mediaService, transactionService } from './index';

// File Validation Constants
const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_AUDIO_EXTS = ['mp3'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates a file against allowed extensions and maximum size limits.
 */
function validateFile(file: File, allowedExts: string[], maxSize: number) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExts.includes(extension)) {
    throw new Error(`Tipe file tidak didukung. File harus berupa: ${allowedExts.join(', ')}`);
  }
  if (file.size > maxSize) {
    const sizeInMB = maxSize / (1024 * 1024);
    throw new Error(`Ukuran file terlalu besar. Batas maksimal adalah ${sizeInMB} MB`);
  }
}

/**
 * Storage Helper Service for NikahYuk! digital invitation app
 */
export const storageService = {
  /**
   * Helper to retrieve the public URL for a specific object path inside a bucket
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Helper to upload a general file to any bucket.
   * Handles validation based on bucket type.
   */
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    // Determine file type category based on the bucket name
    if (bucket === 'music') {
      validateFile(file, ALLOWED_AUDIO_EXTS, MAX_AUDIO_SIZE);
    } else {
      // payment-proofs, template-thumbnails, invitation-media are image-based
      validateFile(file, ALLOWED_IMAGE_EXTS, MAX_IMAGE_SIZE);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error(`Gagal upload file ke ${bucket}/${path}:`, error.message);
      throw error;
    }

    return this.getPublicUrl(bucket, path);
  },

  /**
   * Helper to delete a file from any bucket.
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`Gagal menghapus file ${bucket}/${path}:`, error.message);
      throw error;
    }
    return true;
  },

  /**
   * Upload thumbnail template (Super Admin function)
   * Saves metadata & updates templates table
   */
  async uploadTemplateThumbnail(templateId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    // Admin uploads can specify a clean hierarchy
    const filePath = `templates/${templateId}/thumbnail_${Date.now()}.${fileExt}`;
    
    // Upload image
    const publicUrl = await this.uploadFile(file, 'template-thumbnails', filePath);

    // Save public url to related row in templates table
    await templateService.update(templateId, { thumbnail_url: publicUrl });

    return publicUrl;
  },

  /**
   * Upload invitation thumbnail for WhatsApp sharing card / social sharing
   * Saves to invitations table under user_id prefix folder path
   */
  async uploadWhatsAppThumbnail(invitationId: string, userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    // RLS requires the first subfolder to match auth.uid() (userId)
    const filePath = `${userId}/invitations/${invitationId}/wa_thumbnail_${Date.now()}.${fileExt}`;

    const publicUrl = await this.uploadFile(file, 'invitation-media', filePath);

    // Save to invitations table
    await invitationService.update(invitationId, { thumbnail_url: publicUrl });

    return publicUrl;
  },

  /**
   * Upload dynamic photos for invitation gallery
   * Inserts a record in the media table, automatically linked to invitation_id
   */
  async uploadGalleryPhoto(invitationId: string, userId: string, file: File, caption = '', sortOrder = 0): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    // RLS requires first subfolder to match auth.uid() (userId)
    const filePath = `${userId}/invitations/${invitationId}/gallery/gallery_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;

    const publicUrl = await this.uploadFile(file, 'invitation-media', filePath);

    // Create a new record in the media table
    await mediaService.create({
      invitation_id: invitationId,
      url: publicUrl,
      type: 'image',
      caption: caption || file.name.split('.')[0] || 'Foto Galeri',
      sort_order: sortOrder,
    });

    return publicUrl;
  },

  /**
   * Upload custom background audio tracks (.mp3)
   * Saves music url to matching invitation record
   */
  async uploadMusic(invitationId: string, userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    // RLS requires first subfolder to match auth.uid() (userId)
    const filePath = `${userId}/invitations/${invitationId}/music/bgm_${Date.now()}.${fileExt}`;

    const publicUrl = await this.uploadFile(file, 'music', filePath);

    // Update invitations table
    await invitationService.update(invitationId, { music_url: publicUrl });

    return publicUrl;
  },

  /**
   * Upload bank transfer receipt proof to verify purchase of design package
   * Saves proof url to transactions table
   */
  async uploadPaymentProof(transactionId: string, userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    // RLS requires first subfolder to match auth.uid() (userId)
    const filePath = `${userId}/transactions/${transactionId}/proof_${Date.now()}.${fileExt}`;

    const publicUrl = await this.uploadFile(file, 'payment-proofs', filePath);

    // Update transactions table
    await transactionService.update(transactionId, { proof_url: publicUrl });

    return publicUrl;
  }
};
