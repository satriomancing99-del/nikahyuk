import { BaseService } from './baseService';
import { supabase } from '../lib/supabase';
import { cloudflareApi } from '../lib/cloudflare-api';
import * as T from '../types/database.types';

const USE_D1 = import.meta.env.VITE_USE_D1_AUTH === 'true';

// Generic Basic CRUD Services
export const profileService = new BaseService<T.Profile>('profiles');
export const templateService = new BaseService<T.Template>('templates');
export const eventService = new BaseService<T.Event>('events');
export const wishService = new BaseService<T.Wish>('wishes');
export const giftService = new BaseService<T.Gift>('gifts');
export const mediaService = new BaseService<T.Media>('media');
export const checkinService = new BaseService<T.Checkin>('checkins');
export const packageService = new BaseService<T.Package>('packages');
export const transactionService = new BaseService<T.Transaction>('transactions');
export const promoService = new BaseService<T.Promo>('promos');

// Extended Services with Relationships

class InvitationService extends BaseService<T.Invitation> {
  constructor() {
    super('invitations');
  }

  async getAll(filter?: Record<string, any>) {
    if (USE_D1) {
      const d1Filter: Record<string, string> = {};
      if (filter) {
        Object.entries(filter).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            d1Filter[k] = String(v);
          }
        });
      }
      const list = await cloudflareApi.getTableRows<T.Invitation>(this.tableName, d1Filter);
      const templates = await cloudflareApi.getTableRows<T.Template>('templates');
      return list.map(inv => ({
        ...inv,
        templates: templates.find(t => t.id === inv.template_id) || null
      }));
    }
    let query = supabase
      .from(this.tableName)
      .select('*, templates:template_id(*)')
      .order('created_at', { ascending: false });
    if (filter) {
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          query = query.eq(k, v);
        }
      });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getByUserId(userId: string) {
    if (USE_D1) {
      const list = await cloudflareApi.getInvitationsByUserId(userId);
      const templates = await cloudflareApi.getTableRows<T.Template>('templates');
      return list.map(inv => ({
        ...inv,
        templates: templates.find(t => t.id === inv.template_id) || null
      }));
    }
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, templates:template_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
    if (USE_D1) {
      const inv = await cloudflareApi.getInvitationBySlug(slug);
      if (!inv) throw new Error("Undangan tidak ditemukan");
      
      const events = await cloudflareApi.getTableRows<T.Event>('events', { invitation_id: inv.id });
      const gifts = await cloudflareApi.getTableRows<T.Gift>('gifts', { invitation_id: inv.id });
      const media = await cloudflareApi.getTableRows<T.Media>('media', { invitation_id: inv.id });
      
      return {
        ...inv,
        events,
        gifts,
        media
      };
    }
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, events(*), gifts(*), media(*)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }
}
export const invitationService = new InvitationService();

class GuestService extends BaseService<T.Guest> {
  constructor() {
    super('guests');
  }

  async getByInvitationId(invitationId: string) {
    if (USE_D1) {
      return await cloudflareApi.getGuestsByInvitationId(invitationId);
    }
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data as T.Guest[];
  }
  
  async getByGuestCode(code: string) {
    if (USE_D1) {
      const list = await cloudflareApi.getTableRows<T.Guest>(this.tableName, { guest_code: code });
      if (list.length === 0) throw new Error("Tamu tidak ditemukan");
      return list[0];
    }
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('guest_code', code)
      .single();
    if (error) throw error;
    return data as T.Guest;
  }
}
export const guestService = new GuestService();

class RsvpService extends BaseService<T.Rsvp> {
  constructor() {
    super('rsvps');
  }
  
  async getByInvitationId(invitationId: string) {
    if (USE_D1) {
      return await cloudflareApi.getRecentRsvps(invitationId, 1000);
    }
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as T.Rsvp[];
  }
}
export const rsvpService = new RsvpService();

class MusicLibraryService extends BaseService<T.MusicLibrary> {
  constructor() {
    super('music_library');
  }

  async uploadAndSaveTrack(
    file: File,
    title: string,
    artist: string,
    isPrivate: boolean,
    userId: string,
    role: string
  ): Promise<T.MusicLibrary> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    let filePath = '';
    
    if (role === 'super_admin' && !isPrivate) {
      filePath = `shared/music/bgm_${Date.now()}.${fileExt}`;
    } else {
      filePath = `${userId}/music/bgm_${Date.now()}.${fileExt}`;
    }

    // Dynamic import to prevent circular dependency
    const { storageService } = await import('./storageService');
    const publicUrl = await storageService.uploadFile(file, 'music', filePath);

    const newTrack = await this.create({
      title,
      artist: artist || 'Unknown',
      url: publicUrl,
      is_private: isPrivate,
      created_by: userId,
    });

    return newTrack;
  }
}
export const musicLibraryService = new MusicLibraryService();

export { storageService } from './storageService';

