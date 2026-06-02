-- 012_system_settings.sql
-- Migration to set up the system_settings table for global system configurations.

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Disable existing policies if any
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can write/update system settings" ON public.system_settings;

-- 1. SELECT POLICY: Anyone can read system settings
CREATE POLICY "Anyone can read system settings"
ON public.system_settings FOR SELECT
TO authenticated, anon
USING (true);

-- 2. ALL/WRITE POLICY: Only super admins can write or update settings
CREATE POLICY "Admins can write/update system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Seed initial setting
INSERT INTO public.system_settings (key, value)
VALUES ('collaboration_enabled', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
