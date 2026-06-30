-- 011_music_library.sql
-- Migration to set up the BGM/Music Library table and its RLS policies.

CREATE TABLE IF NOT EXISTS public.music_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'Unknown',
  url TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.music_library ENABLE ROW LEVEL SECURITY;

-- Disable existing policies if any
DROP POLICY IF EXISTS "Anyone can select public music, or owner private music" ON public.music_library;
DROP POLICY IF EXISTS "Admins can insert shared music, Platinum users can insert private music" ON public.music_library;
DROP POLICY IF EXISTS "Admins can delete any music, owners can delete private music" ON public.music_library;

-- 1. SELECT POLICY: 
-- Anyone can read public songs (is_private = false)
-- Owners can read their own private songs (is_private = true and created_by = auth.uid())
-- Super admins can read all songs
CREATE POLICY "Anyone can select public music, or owner private music"
ON public.music_library FOR SELECT
TO authenticated, anon
USING (
  is_private = false 
  OR (is_private = true AND created_by = auth.uid())
  -- Support super_admin check
  OR (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'super_admin'
);

-- 2. INSERT POLICY:
-- Super admins can insert any song (usually public is_private = false)
-- Platinum users can insert their own private songs (is_private = true)
CREATE POLICY "Admins can insert shared music, Platinum users can insert private music"
ON public.music_library FOR INSERT
TO authenticated
WITH CHECK (
  -- Super admin can insert anything
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR (
    -- Platinum user can insert private music linked to their own account
    is_private = true 
    AND created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND active_package_id = '550e8400-e29b-41d4-a716-446655440003' -- Platinum Package ID
      AND (package_expired_at IS NULL OR package_expired_at > now())
    )
  )
);

-- 3. DELETE POLICY:
-- Super admins can delete any song
-- Owners can delete their own private songs
CREATE POLICY "Admins can delete any music, owners can delete private music"
ON public.music_library FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  OR (created_by = auth.uid())
);
