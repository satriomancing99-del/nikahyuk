import { BaseService } from './baseService';
import { supabase } from '../lib/supabase';
import * as T from '../types/database.types';

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

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, templates:template_id(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, templates:template_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string) {
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
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('invitation_id', invitationId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data as T.Guest[];
  }
  
  async getByGuestCode(code: string) {
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

export { storageService } from './storageService';
