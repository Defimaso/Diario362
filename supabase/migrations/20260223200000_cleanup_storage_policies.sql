-- Cleanup duplicate storage policies for progress-photos bucket
-- Migration 1 (20260123) created policies with "progress photos" in name
-- Migration 2 (20260125174906) added more policies
-- Migration 3 (20260125230503) dropped some but missed the originals from migration 1
-- This migration cleans up all duplicates and keeps only the strict set

-- Drop OLD policies from migration 1 (never cleaned up)
DROP POLICY IF EXISTS "Users can upload their own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and collaborators can view client progress photos" ON storage.objects;

-- Drop the overly permissive public SELECT from migration 2 (was never dropped because name mismatch)
DROP POLICY IF EXISTS "Anyone can view progress photos" ON storage.objects;

-- The strict policies from migration 3 remain:
-- "Users can upload their own photos" (INSERT, TO authenticated)
-- "Users can view their own photos" (SELECT, TO authenticated, includes admin/collaborator)
-- "Users can update their own photos" (UPDATE, TO authenticated)
-- "Users can delete their own photos" (DELETE, TO authenticated)

-- Ensure bucket is still public (needed for getPublicUrl to work)
UPDATE storage.buckets SET public = true WHERE id = 'progress-photos';
