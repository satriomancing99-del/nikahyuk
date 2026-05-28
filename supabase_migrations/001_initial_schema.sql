-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: templates
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  slug TEXT UNIQUE,
  category TEXT,
  price NUMERIC,
  thumbnail_url TEXT,
  preview_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  slug TEXT UNIQUE,
  groom_name TEXT,
  bride_name TEXT,
  groom_parent TEXT,
  bride_parent TEXT,
  quote TEXT,
  love_story TEXT,
  music_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft',
  expired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  date DATE,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  location_name TEXT,
  address TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: guests
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  guest_code TEXT UNIQUE,
  personal_link TEXT,
  qr_code_value TEXT,
  sent_status TEXT DEFAULT 'not_sent',
  opened_at TIMESTAMP WITH TIME ZONE,
  rsvp_status TEXT DEFAULT 'not_confirmed',
  checkin_status TEXT DEFAULT 'not_checked_in',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: rsvps
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT,
  attendance_status TEXT,
  total_guest INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: wishes
CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: gifts
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  type TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  ewallet_name TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: media
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  type TEXT,
  url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: checkins
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  checked_in_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'checked_in'
);

-- Table: packages
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  price NUMERIC,
  features JSONB,
  active_period INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  amount NUMERIC,
  payment_status TEXT DEFAULT 'pending',
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS invitations_slug_idx ON public.invitations (slug);
CREATE INDEX IF NOT EXISTS guests_guest_code_idx ON public.guests (guest_code);
CREATE INDEX IF NOT EXISTS guests_invitation_id_idx ON public.guests (invitation_id);
CREATE INDEX IF NOT EXISTS rsvps_invitation_id_idx ON public.rsvps (invitation_id);
CREATE INDEX IF NOT EXISTS checkins_invitation_id_idx ON public.checkins (invitation_id);
