-- Make progress-photos bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'progress-photos';

-- Policy per permettere agli utenti autenticati di caricare le proprie foto
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per permettere agli utenti di aggiornare le proprie foto
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per permettere agli utenti di eliminare le proprie foto
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy per permettere la lettura pubblica (necessaria per visualizzare le foto)
CREATE POLICY "Anyone can view progress photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'progress-photos');