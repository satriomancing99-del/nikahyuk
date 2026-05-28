export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'super_admin' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  thumbnail_url: string;
  preview_url: string;
  status: string;
  jsx_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  template_id: string;
  slug: string;
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  quote: string;
  love_story: string;
  music_url: string;
  thumbnail_url: string;
  status: string;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  invitation_id: string;
  type: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  google_maps_url: string;
  created_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  phone: string;
  guest_code: string;
  personal_link: string;
  qr_code_value: string;
  sent_status: string;
  opened_at: string | null;
  rsvp_status: string;
  checkin_status: string;
  created_at: string;
}

export interface Rsvp {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  guest_name: string;
  attendance_status: string;
  total_guest: number;
  message: string;
  created_at: string;
}

export interface Wish {
  id: string;
  invitation_id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export interface Gift {
  id: string;
  invitation_id: string;
  type: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  ewallet_name: string;
  address: string;
  created_at: string;
}

export interface Media {
  id: string;
  invitation_id: string;
  type: string;
  url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface Checkin {
  id: string;
  invitation_id: string;
  guest_id: string;
  checked_in_at: string;
  checked_in_by: string;
  status: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  features: Record<string, any>;
  active_period: number;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  package_id: string;
  invitation_id: string;
  amount: number;
  payment_status: string;
  proof_url: string;
  created_at: string;
  original_amount?: number;
  promo_code?: string;
  discount_amount?: number;
  activated_at?: string;
  expired_at?: string;
}

export interface Promo {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_transaction: number;
  usage_limit: number | null;
  usage_count: number;
  status: string;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
}
