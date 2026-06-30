-- 015_allow_select_all_templates.sql
-- Allow anyone (anonymous or authenticated) to view all templates to support previewing customer/contributor submissions.

DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
DROP POLICY IF EXISTS "Authenticated users can select own templates" ON public.templates;
DROP POLICY IF EXISTS "Anyone can view templates" ON public.templates;

CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  USING (true);

