-- Migration: Add jsx_code column to public.templates table
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS jsx_code TEXT;
