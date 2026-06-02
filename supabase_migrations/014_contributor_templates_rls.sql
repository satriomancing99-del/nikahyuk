-- 014_contributor_templates_rls.sql
-- Migration to allow authenticated contributors (customers/creators) to manage their submitted templates.

-- Allow authenticated users to view templates they created
CREATE POLICY "Authenticated users can select own templates"
  ON public.templates FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

-- Allow authenticated users to insert new templates they created
CREATE POLICY "Authenticated users can insert own templates"
  ON public.templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update templates they created
CREATE POLICY "Authenticated users can update own templates"
  ON public.templates FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to delete templates they created
CREATE POLICY "Authenticated users can delete own templates"
  ON public.templates FOR DELETE TO authenticated
  USING (auth.uid() = created_by);
