-- 016_add_greeting_to_invitations.sql
-- Add greeting column to invitations table to support custom opening greetings for different religions.

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS greeting TEXT DEFAULT 'Assalamu''alaikum Warahmatullahi Wabarakatuh';
