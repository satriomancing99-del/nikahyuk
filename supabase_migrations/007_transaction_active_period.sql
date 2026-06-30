-- Migration: Add activated_at and expired_at columns to public.transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP WITH TIME ZONE;
