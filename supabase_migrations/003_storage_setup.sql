-- 003_storage_setup.sql
-- Migration to set up Supabase Storage Buckets and policies for NikahYuk!

-- Insert buckets into storage.buckets if they do not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('template-thumbnails', 'template-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('invitation-media', 'invitation-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('music', 'music', true, 10485760, ARRAY['audio/mpeg', 'audio/mp3']),
  ('payment-proofs', 'payment-proofs', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure RLS is active on storage.objects (Commented out because it is enabled by default and postgres doesn't own this table)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Disable existing policies if any to prevent duplicates during run
DROP POLICY IF EXISTS "Template thumbnails are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can manage template-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Invitation media is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert invitation-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete own invitation-media" ON storage.objects;
DROP POLICY IF EXISTS "Music is publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert music" ON storage.objects;
DROP POLICY IF EXISTS "Users can update/delete own music" ON storage.objects;
DROP POLICY IF EXISTS "Payment proofs are publicly readable or owner managed" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can insert payment-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own payment-proofs" ON storage.objects;


-- ============================================================================
-- 1. template-thumbnails POLICIES (Publicly readable, managed by super_admins)
-- ============================================================================
CREATE POLICY "Template thumbnails are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-thumbnails');

CREATE POLICY "Super admins can manage template-thumbnails"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'template-thumbnails' AND public.is_super_admin())
WITH CHECK (bucket_id = 'template-thumbnails' AND public.is_super_admin());


-- ============================================================================
-- 2. invitation-media POLICIES (Publicly readable, uploaded under user_id prefix)
-- ============================================================================
CREATE POLICY "Invitation media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'invitation-media');

CREATE POLICY "Authenticated users can insert invitation-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invitation-media' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));

CREATE POLICY "Users can update/delete own invitation-media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'invitation-media' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()))
WITH CHECK (bucket_id = 'invitation-media' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));


-- ============================================================================
-- 3. music POLICIES (Publicly readable, uploaded under user_id prefix)
-- ============================================================================
CREATE POLICY "Music is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can insert music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));

CREATE POLICY "Users can update/delete own music"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'music' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()))
WITH CHECK (bucket_id = 'music' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));


-- ============================================================================
-- 4. payment-proofs POLICIES (Publicly readable/viewable, uploaded under user_id)
-- ============================================================================
CREATE POLICY "Payment proofs are publicly readable or owner managed"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can insert payment-proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));

CREATE POLICY "Users can delete own payment-proofs"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()))
WITH CHECK (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin()));
