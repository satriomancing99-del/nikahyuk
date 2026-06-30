-- Migration: Add Promos Table and Expand Transactions Table
-- This establishes the promo code database support for discounts.

-- 1. Create promos table
CREATE TABLE IF NOT EXISTS public.promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  min_transaction NUMERIC DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL,
  usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' or 'inactive'
  expired_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add discount tracking columns to transactions table
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS original_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 3. Enable Row Level Security (RLS) on promos table
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for promos table
CREATE POLICY "Super admins can manage all promos" 
  ON public.promos FOR ALL USING (public.is_super_admin());

CREATE POLICY "Authenticated users can view promos" 
  ON public.promos FOR SELECT TO authenticated USING (true);

-- 5. Grant access to service role / anon / authenticated roles
GRANT ALL ON public.promos TO postgres;
GRANT ALL ON public.promos TO service_role;
GRANT SELECT ON public.promos TO authenticated;
GRANT SELECT ON public.promos TO anon;
