-- Make payment-receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'payment-receipts';

-- Drop existing overly-permissive storage policies
DROP POLICY IF EXISTS "Payment receipts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment receipts" ON storage.objects;

-- Create secure storage policies for payment receipts
-- Allow admins to view receipts
CREATE POLICY "Admins can view payment receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to upload receipts (for payment submission)
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to delete receipts
CREATE POLICY "Admins can delete payment receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'payment-receipts' 
  AND has_role(auth.uid(), 'admin'::app_role)
);