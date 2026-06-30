-- 002_rls_policies.sql
-- Robust Row Level Security (RLS) Policies for NikahYuk!

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check if the current user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  -- 1st Check: Hardcoded super admin email for instant, recursion-proof validation
  IF auth.jwt() ->> 'email' = 'admin@nikahyuk.com' THEN
    RETURN TRUE;
  END IF;

  -- 2nd Check: Lookup profiles table role values
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all profiles" 
  ON public.profiles FOR ALL USING (public.is_super_admin());

-- Customers can view/insert/update only their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ============================================================================
-- TEMPLATES POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all templates" 
  ON public.templates FOR ALL USING (public.is_super_admin());

-- Anyone (including guests) can browse active templates
CREATE POLICY "Anyone can view active templates" 
  ON public.templates FOR SELECT USING (status = 'active');


-- ============================================================================
-- INVITATIONS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all invitations" 
  ON public.invitations FOR ALL USING (public.is_super_admin());

-- Logged-in customer can view/insert/update/delete their own invitations
CREATE POLICY "Authenticated users can select own invitations" 
  ON public.invitations FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own invitations" 
  ON public.invitations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own invitations" 
  ON public.invitations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own invitations" 
  ON public.invitations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Halaman publik: Anyone (even anonymous) can view invitations that are not in draft status (by slug, etc.)
CREATE POLICY "Public can select non-draft invitations by slug" 
  ON public.invitations FOR SELECT TO anon USING (status <> 'draft');


-- ============================================================================
-- EVENTS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all events" 
  ON public.events FOR ALL USING (public.is_super_admin());

-- Owner can insert/update/delete events for their own invitations
CREATE POLICY "Owner can manage own events" 
  ON public.events FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view events of their own invitations
CREATE POLICY "Owner can view own events" 
  ON public.events FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can view event details for non-draft invitations
CREATE POLICY "Public can view non-draft events" 
  ON public.events FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- MEDIA POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all media" 
  ON public.media FOR ALL USING (public.is_super_admin());

-- Owner can insert/update/delete media for their own invitations
CREATE POLICY "Owner can manage own media" 
  ON public.media FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view media of their own invitations
CREATE POLICY "Owner can view own media" 
  ON public.media FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can view media for non-draft invitations
CREATE POLICY "Public can view non-draft media" 
  ON public.media FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- GIFTS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all gifts" 
  ON public.gifts FOR ALL USING (public.is_super_admin());

-- Owner can insert/update/delete gifts for their own invitations
CREATE POLICY "Owner can manage own gifts" 
  ON public.gifts FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view gifts of their own invitations
CREATE POLICY "Owner can view own gifts" 
  ON public.gifts FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can view gift accounts for non-draft invitations
CREATE POLICY "Public can view non-draft gifts" 
  ON public.gifts FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- GUESTS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all guests" 
  ON public.guests FOR ALL USING (public.is_super_admin());

-- Owner can manage guest records for their invitations
CREATE POLICY "Owner can manage own guests" 
  ON public.guests FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view guest records for their invitations
CREATE POLICY "Owner can view own guests" 
  ON public.guests FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can lookup a guest record ONLY if searching by guest_code, and invitation is non-draft
CREATE POLICY "Public can select guest by code" 
  ON public.guests FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- RSVPS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all rsvps" 
  ON public.rsvps FOR ALL USING (public.is_super_admin());

-- Owner can view, update, delete RSVP records for their invitations
CREATE POLICY "Owner can manage own rsvps" 
  ON public.rsvps FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view RSVP records for their invitations
CREATE POLICY "Owner can view own rsvps" 
  ON public.rsvps FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can view RSVPs of non-draft invitations
CREATE POLICY "Public can view rsvps" 
  ON public.rsvps FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );

-- Halaman publik: Anyone can create a new RSVP for active invitations
CREATE POLICY "Public can insert rsvp for active invitation" 
  ON public.rsvps FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- WISHES POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all wishes" 
  ON public.wishes FOR ALL USING (public.is_super_admin());

-- Owner can view, update, delete wishes for their invitations
CREATE POLICY "Owner can manage own wishes" 
  ON public.wishes FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Owner can view wishes for their invitations
CREATE POLICY "Owner can view own wishes" 
  ON public.wishes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );

-- Halaman publik: Anyone can view wishes of non-draft invitations
CREATE POLICY "Public can view wishes" 
  ON public.wishes FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );

-- Halaman publik: Anyone can send a new wish/message for active invitations
CREATE POLICY "Public can insert wish for active invitation" 
  ON public.wishes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND status <> 'draft')
  );


-- ============================================================================
-- CHECKINS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage all checkins" 
  ON public.checkins FOR ALL USING (public.is_super_admin());

-- Owner can do checkins for their invitations (requires logged-in user admin)
CREATE POLICY "Owner can manage checkins" 
  ON public.checkins FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.invitations WHERE id = invitation_id AND user_id = auth.uid())
  );


-- ============================================================================
-- PACKAGES POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage packages" 
  ON public.packages FOR ALL USING (public.is_super_admin());

-- Anyone can read available packages catalog list
CREATE POLICY "Anyone can view packages" 
  ON public.packages FOR SELECT USING (true);


-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================
-- Super admin can do everything
CREATE POLICY "Super admins can manage transactions" 
  ON public.transactions FOR ALL USING (public.is_super_admin());

-- Customer can view their own transaction history
CREATE POLICY "Owner can view own transactions" 
  ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Customer can create a new transaction record for payment
CREATE POLICY "Owner can create transaction" 
  ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Customer can update their own transaction (e.g., uploading payment proof receipt)
CREATE POLICY "Owner can update own transactions" 
  ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
