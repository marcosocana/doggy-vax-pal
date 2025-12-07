-- Create enum for vaccine status
CREATE TYPE public.vaccine_status AS ENUM ('administered', 'scheduled', 'overdue');

-- Create enum for periodicity unit
CREATE TYPE public.periodicity_unit AS ENUM ('days', 'weeks', 'months', 'years');

-- Create enum for vaccine type (for color coding)
CREATE TYPE public.vaccine_type AS ENUM ('core', 'non_core', 'optional', 'deworming', 'other');

-- Create vaccines table
CREATE TABLE public.vaccines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  periodicity INTEGER,
  periodicity_unit public.periodicity_unit,
  status public.vaccine_status NOT NULL DEFAULT 'scheduled',
  vaccine_type public.vaccine_type NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own vaccines"
ON public.vaccines
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vaccines"
ON public.vaccines
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaccines"
ON public.vaccines
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaccines"
ON public.vaccines
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vaccines_updated_at
BEFORE UPDATE ON public.vaccines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();