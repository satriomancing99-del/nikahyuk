-- 009_protect_profile_role.sql
-- Prevent privilege escalation: Stop users from updating their own role column to super_admin or changing role values via client-side updates.

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
  -- If the role is being updated/changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow changes if the updater is super_admin OR the email is admin@nikahyuk.com
    IF NOT (
      auth.jwt() ->> 'email' = 'admin@nikahyuk.com' OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
      )
    ) THEN
      -- Revert the role change to the old value
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;

-- Attach trigger to run BEFORE any update on the public.profiles table
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();
