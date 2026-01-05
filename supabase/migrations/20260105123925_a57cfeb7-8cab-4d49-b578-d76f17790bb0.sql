-- Add phone_number field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.phone_number IS 'International phone number with country code (e.g., +393331234567)';