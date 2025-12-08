-- Add password and photo_url columns to dogs table
ALTER TABLE public.dogs 
ADD COLUMN password TEXT NOT NULL DEFAULT '0000',
ADD COLUMN photo_url TEXT;

-- Create storage bucket for dog photos
INSERT INTO storage.buckets (id, name, public) VALUES ('dog-photos', 'dog-photos', true);

-- Allow anyone to upload dog photos
CREATE POLICY "Anyone can upload dog photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'dog-photos');

-- Allow anyone to view dog photos
CREATE POLICY "Anyone can view dog photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dog-photos');

-- Allow anyone to update dog photos
CREATE POLICY "Anyone can update dog photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'dog-photos');

-- Allow anyone to delete dog photos
CREATE POLICY "Anyone can delete dog photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'dog-photos');