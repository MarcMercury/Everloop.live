-- Create storage bucket for entity images
-- Run this in the Supabase SQL Editor

-- Create the entity-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('entity-images', 'entity-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload entity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'entity-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view entity images (public bucket)
CREATE POLICY "Entity images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'entity-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own entity images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'entity-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own entity images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'entity-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
