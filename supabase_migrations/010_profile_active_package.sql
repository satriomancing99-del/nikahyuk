-- 010_profile_active_package.sql
-- Add active package tracking columns directly to the profiles table for fast access control,
-- and create a PostgreSQL database trigger to automatically calculate and activate the package upon transaction approval.

-- 1. Add columns to public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS active_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_expired_at TIMESTAMP WITH TIME ZONE;

-- 2. Create a robust database trigger function on public.transactions
CREATE OR REPLACE FUNCTION public.handle_transaction_approval()
RETURNS trigger AS $$
DECLARE
  v_active_period INT;
  v_activated_at TIMESTAMPTZ;
  v_expired_at TIMESTAMPTZ;
BEGIN
  -- Trigger only when payment_status changes from pending/failed to success
  IF NEW.payment_status = 'success' AND (OLD.payment_status IS DISTINCT FROM 'success') THEN
    -- A. Fetch package active period (in days)
    SELECT active_period INTO v_active_period 
    FROM public.packages 
    WHERE id = NEW.package_id;
    
    -- Fallback to 90 days if package or active_period is not found
    IF v_active_period IS NULL THEN
      v_active_period := 90;
    END IF;

    -- B. Set timestamps
    v_activated_at := now();
    v_expired_at := now() + (v_active_period || ' days')::interval;

    -- C. Update the transaction's own activated_at and expired_at columns
    NEW.activated_at := v_activated_at;
    NEW.expired_at := v_expired_at;

    -- D. Update the customer's profile with their new active package and expiry date
    UPDATE public.profiles
    SET 
      active_package_id = NEW.package_id,
      package_expired_at = v_expired_at,
      updated_at = now()
    WHERE id = NEW.user_id;

    -- E. Update the corresponding invitation's expired_at date
    IF NEW.invitation_id IS NOT NULL THEN
      UPDATE public.invitations
      SET 
        expired_at = v_expired_at,
        updated_at = now()
      WHERE id = NEW.invitation_id;
    ELSE
      -- If invitation_id is null in transaction, update the most recent invitation of the user
      UPDATE public.invitations
      SET 
        expired_at = v_expired_at,
        updated_at = now()
      WHERE id = (
        SELECT id FROM public.invitations 
        WHERE user_id = NEW.user_id 
        ORDER BY created_at DESC 
        LIMIT 1
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind the trigger to public.transactions
DROP TRIGGER IF EXISTS on_transaction_approved ON public.transactions;

CREATE TRIGGER on_transaction_approved
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_approval();
