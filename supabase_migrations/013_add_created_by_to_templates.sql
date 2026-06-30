-- 013_add_created_by_to_templates.sql
-- Migration to add created_by field to templates table to enable tracking contributor submissions.

ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
