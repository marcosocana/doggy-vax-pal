-- Create dogs table
CREATE TABLE public.dogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;

-- Public policies for dogs (anyone can CRUD)
CREATE POLICY "Anyone can view dogs" ON public.dogs FOR SELECT USING (true);
CREATE POLICY "Anyone can create dogs" ON public.dogs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update dogs" ON public.dogs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete dogs" ON public.dogs FOR DELETE USING (true);

-- Update vaccines table: remove user_id requirement, add dog_id
ALTER TABLE public.vaccines ADD COLUMN dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE;
ALTER TABLE public.vaccines ALTER COLUMN user_id DROP NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own vaccines" ON public.vaccines;
DROP POLICY IF EXISTS "Users can create their own vaccines" ON public.vaccines;
DROP POLICY IF EXISTS "Users can update their own vaccines" ON public.vaccines;
DROP POLICY IF EXISTS "Users can delete their own vaccines" ON public.vaccines;

-- New public policies for vaccines (linked to dogs)
CREATE POLICY "Anyone can view vaccines" ON public.vaccines FOR SELECT USING (true);
CREATE POLICY "Anyone can create vaccines" ON public.vaccines FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vaccines" ON public.vaccines FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete vaccines" ON public.vaccines FOR DELETE USING (true);