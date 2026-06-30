-- 017_update_transaction_trigger.sql
-- Update handle_transaction_approval to run BEFORE INSERT OR UPDATE, making 100% promo transactions succeed immediately.

CREATE OR REPLACE FUNCTION public.handle_transaction_approval()
RETURNS trigger AS $$
DECLARE
  v_active_period INT;
  v_activated_at TIMESTAMPTZ;
  v_expired_at TIMESTAMPTZ;
BEGIN
  -- Trigger when inserting a successful transaction or updating payment_status to success
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'success') OR
     (TG_OP = 'UPDATE' AND NEW.payment_status = 'success' AND (OLD.payment_status IS DISTINCT FROM 'success')) THEN
     
    -- A. Fetch package active period (in days)
    SELECT active_period INTO v_active_period 
    FROM public.packages 
    WHERE id = NEW.package_id;
    
    -- Fallback to 90 days if package or active_period is not found
    IF v_active_period IS NULL THEN
      v_active_period := 90;
    END IF;

    -- B. Set timestamps if they are not already provided (avoid overwriting if explicitly passed)
    IF NEW.activated_at IS NULL THEN
      NEW.activated_at := now();
    END IF;
    
    IF NEW.expired_at IS NULL THEN
      NEW.expired_at := NEW.activated_at + (v_active_period || ' days')::interval;
    END IF;

    -- C. Update the customer's profile with their new active package and expiry date
    UPDATE public.profiles
    SET 
      active_package_id = NEW.package_id,
      package_expired_at = NEW.expired_at,
      updated_at = now()
    WHERE id = NEW.user_id;

    -- D. Update the corresponding invitation's expired_at date
    IF NEW.invitation_id IS NOT NULL THEN
      UPDATE public.invitations
      SET 
        expired_at = NEW.expired_at,
        updated_at = now()
      WHERE id = NEW.invitation_id;
    ELSE
      -- If invitation_id is null in transaction, update the most recent invitation of the user
      UPDATE public.invitations
      SET 
        expired_at = NEW.expired_at,
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

-- Bind trigger on INSERT OR UPDATE
DROP TRIGGER IF EXISTS on_transaction_approved ON public.transactions;

CREATE TRIGGER on_transaction_approved
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_approval();
