// worker/src/db/repositories.ts
// Data Access Layer (Repository Pattern) for Cloudflare D1 SQLite database

// --- ENTITIES & PAYLOADS TYPES ---

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: 'super_admin' | 'customer';
  active_package_id: string | null;
  package_expired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfilePayload {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: 'super_admin' | 'customer';
}

export interface Invitation {
  id: string;
  user_id: string;
  template_id: string | null;
  slug: string;
  groom_name: string | null;
  bride_name: string | null;
  groom_parent: string | null;
  bride_parent: string | null;
  quote: string | null;
  love_story: string | null;
  music_url: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'expired';
  expired_at: string | null;
  greeting_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationPayload {
  id?: string; // Optional: can be generated via crypto.randomUUID() if not provided
  user_id: string;
  template_id?: string;
  slug: string;
  groom_name?: string;
  bride_name?: string;
  groom_parent?: string;
  bride_parent?: string;
  quote?: string;
  love_story?: string;
  music_url?: string;
  thumbnail_url?: string;
  status?: 'draft' | 'published' | 'expired';
  expired_at?: string;
  greeting_text?: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  phone: string | null;
  guest_code: string;
  personal_link: string | null;
  qr_code_value: string | null;
  sent_status: 'not_sent' | 'sent' | 'failed';
  opened_at: string | null;
  rsvp_status: 'not_confirmed' | 'attending' | 'declined';
  checkin_status: 'not_checked_in' | 'checked_in';
  created_at: string;
}

export interface CreateGuestPayload {
  id?: string;
  invitation_id: string;
  name: string;
  phone?: string;
  guest_code: string;
  personal_link?: string;
  qr_code_value?: string;
  sent_status?: 'not_sent' | 'sent' | 'failed';
  rsvp_status?: 'not_confirmed' | 'attending' | 'declined';
  checkin_status?: 'not_checked_in' | 'checked_in';
}

export interface Rsvp {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  guest_name: string;
  attendance_status: 'attending' | 'declined';
  total_guest: number;
  message: string | null;
  created_at: string;
}

export interface CreateRsvpPayload {
  id?: string;
  invitation_id: string;
  guest_id?: string;
  guest_name: string;
  attendance_status: 'attending' | 'declined';
  total_guest?: number;
  message?: string;
}

// --- VALIDATOR HELPERS ---

function validateEmail(email?: string): boolean {
  if (!email) return true; // Optional email validation bypass
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSlug(slug: string): boolean {
  // Slug format: alphanumeric and dashes only, e.g. "budi-ani"
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

// --- REPOSITORIES ---

export class UserRepository {
  constructor(private db: D1Database) {}

  async findUserByEmail(email: string): Promise<Profile | null> {
    if (!validateEmail(email)) throw new Error("Format email tidak valid");
    
    return this.db
      .prepare("SELECT * FROM profiles WHERE email = ?")
      .bind(email)
      .first<Profile>();
  }

  async findUserById(id: string): Promise<Profile | null> {
    if (!id || id.trim() === "") throw new Error("ID user tidak boleh kosong");

    return this.db
      .prepare("SELECT * FROM profiles WHERE id = ?")
      .bind(id)
      .first<Profile>();
  }

  async createUser(data: CreateProfilePayload): Promise<Profile> {
    if (!data.id || data.id.trim() === "") throw new Error("ID user tidak boleh kosong");
    if (data.email && !validateEmail(data.email)) throw new Error("Format email tidak valid");

    const name = data.name || null;
    const email = data.email || null;
    const phone = data.phone || null;
    const role = data.role || 'customer';

    const result = await this.db
      .prepare(
        "INSERT INTO profiles (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?) RETURNING *"
      )
      .bind(data.id, name, email, phone, role)
      .first<Profile>();

    if (!result) throw new Error("Gagal membuat user");
    return result;
  }
}

export class InvitationRepository {
  constructor(private db: D1Database) {}

  async createInvitation(data: CreateInvitationPayload): Promise<Invitation> {
    if (!data.user_id) throw new Error("User ID wajib diisi");
    if (!data.slug || !validateSlug(data.slug)) throw new Error("Slug tidak valid (hanya huruf, angka, dan strip)");

    const id = data.id || crypto.randomUUID();
    const template_id = data.template_id || null;
    const groom_name = data.groom_name || null;
    const bride_name = data.bride_name || null;
    const groom_parent = data.groom_parent || null;
    const bride_parent = data.bride_parent || null;
    const quote = data.quote || null;
    const love_story = data.love_story || null;
    const music_url = data.music_url || null;
    const thumbnail_url = data.thumbnail_url || null;
    const status = data.status || 'draft';
    const expired_at = data.expired_at || null;
    const greeting_text = data.greeting_text || null;

    const result = await this.db
      .prepare(`
        INSERT INTO invitations (
          id, user_id, template_id, slug, groom_name, bride_name, 
          groom_parent, bride_parent, quote, love_story, music_url, 
          thumbnail_url, status, expired_at, greeting_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        id, data.user_id, template_id, data.slug, groom_name, bride_name,
        groom_parent, bride_parent, quote, love_story, music_url,
        thumbnail_url, status, expired_at, greeting_text
      )
      .first<Invitation>();

    if (!result) throw new Error("Gagal membuat undangan");
    return result;
  }

  async findInvitationBySlug(slug: string): Promise<Invitation | null> {
    if (!slug || !validateSlug(slug)) throw new Error("Slug pencarian tidak valid");

    return this.db
      .prepare("SELECT * FROM invitations WHERE slug = ?")
      .bind(slug)
      .first<Invitation>();
  }

  async findInvitationsByUserId(userId: string): Promise<Invitation[]> {
    if (!userId) throw new Error("User ID wajib diisi");

    const { results } = await this.db
      .prepare("SELECT * FROM invitations WHERE user_id = ? ORDER BY created_at DESC")
      .bind(userId)
      .all<Invitation>();

    return results;
  }
}

export class GuestRepository {
  constructor(private db: D1Database) {}

  async createGuest(data: CreateGuestPayload): Promise<Guest> {
    if (!data.invitation_id) throw new Error("Invitation ID wajib diisi");
    if (!data.name || data.name.trim() === "") throw new Error("Nama tamu wajib diisi");
    if (!data.guest_code) throw new Error("Kode tamu wajib diisi");

    const id = data.id || crypto.randomUUID();
    const phone = data.phone || null;
    const personal_link = data.personal_link || null;
    const qr_code_value = data.qr_code_value || null;
    const sent_status = data.sent_status || 'not_sent';
    const rsvp_status = data.rsvp_status || 'not_confirmed';
    const checkin_status = data.checkin_status || 'not_checked_in';

    const result = await this.db
      .prepare(`
        INSERT INTO guests (
          id, invitation_id, name, phone, guest_code, 
          personal_link, qr_code_value, sent_status, rsvp_status, checkin_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        id, data.invitation_id, data.name, phone, data.guest_code,
        personal_link, qr_code_value, sent_status, rsvp_status, checkin_status
      )
      .first<Guest>();

    if (!result) throw new Error("Gagal membuat tamu");
    return result;
  }

  async listGuestsByInvitationId(invitationId: string): Promise<Guest[]> {
    if (!invitationId) throw new Error("Invitation ID wajib diisi");

    const { results } = await this.db
      .prepare("SELECT * FROM guests WHERE invitation_id = ? ORDER BY name ASC")
      .bind(invitationId)
      .all<Guest>();

    return results;
  }
}

export class RsvpRepository {
  constructor(private db: D1Database) {}

  async createRsvp(data: CreateRsvpPayload): Promise<Rsvp> {
    if (!data.invitation_id) throw new Error("Invitation ID wajib diisi");
    if (!data.guest_name || data.guest_name.trim() === "") throw new Error("Nama pengirim RSVP wajib diisi");
    
    const id = data.id || crypto.randomUUID();
    const guest_id = data.guest_id || null;
    const total_guest = data.total_guest || 1;
    const message = data.message || null;

    const result = await this.db
      .prepare(`
        INSERT INTO rsvps (
          id, invitation_id, guest_id, guest_name, attendance_status, total_guest, message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        id, data.invitation_id, guest_id, data.guest_name, data.attendance_status, total_guest, message
      )
      .first<Rsvp>();

    if (!result) throw new Error("Gagal menyimpan RSVP");
    return result;
  }

  async listRsvpsByInvitationId(invitationId: string): Promise<Rsvp[]> {
    if (!invitationId) throw new Error("Invitation ID wajib diisi");

    const { results } = await this.db
      .prepare("SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC")
      .bind(invitationId)
      .all<Rsvp>();

    return results;
  }
}

// --- AUTH ENTITIES & REPOSITORIES ---

export interface AuthUser {
  id: string;
  email: string;
  password_hash: string;
  email_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  expired_at: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export class AuthUserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.db
      .prepare("SELECT * FROM auth_users WHERE email = ?")
      .bind(email.toLowerCase().trim())
      .first<AuthUser>();
  }

  async findById(id: string): Promise<AuthUser | null> {
    return this.db
      .prepare("SELECT * FROM auth_users WHERE id = ?")
      .bind(id)
      .first<AuthUser>();
  }

  async createAuthUser(id: string, email: string, passwordHash: string): Promise<AuthUser> {
    const result = await this.db
      .prepare(
        "INSERT INTO auth_users (id, email, password_hash) VALUES (?, ?, ?) RETURNING *"
      )
      .bind(id, email.toLowerCase().trim(), passwordHash)
      .first<AuthUser>();

    if (!result) throw new Error("Gagal membuat user kredensial");
    return result;
  }
}

export class SessionRepository {
  constructor(private db: D1Database) {}

  async createSession(
    id: string,
    userId: string,
    expiredAt: string,
    userAgent: string | null,
    ipAddress: string | null
  ): Promise<Session> {
    const result = await this.db
      .prepare(`
        INSERT INTO sessions (id, user_id, expired_at, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(id, userId, expiredAt, userAgent, ipAddress)
      .first<Session>();

    if (!result) throw new Error("Gagal membuat session baru");
    return result;
  }

  async findSessionById(id: string): Promise<Session | null> {
    return this.db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .bind(id)
      .first<Session>();
  }

  async deleteSession(id: string): Promise<boolean> {
    await this.db
      .prepare("DELETE FROM sessions WHERE id = ?")
      .bind(id)
      .run();
    return true;
  }
}
