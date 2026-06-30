-- Migration: Update invitations template_id foreign key constraint to SET NULL on delete
-- This prevents foreign key constraint violations when deleting templates from templates manager.

ALTER TABLE public.invitations 
  DROP CONSTRAINT IF EXISTS invitations_template_id_fkey,
  ADD CONSTRAINT invitations_template_id_fkey 
    FOREIGN KEY (template_id) 
    REFERENCES public.templates(id) 
    ON DELETE SET NULL;
