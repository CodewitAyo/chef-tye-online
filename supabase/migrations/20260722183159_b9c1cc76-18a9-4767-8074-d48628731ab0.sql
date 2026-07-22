DROP POLICY IF EXISTS "Public read food-images" ON storage.objects;
CREATE POLICY "Public read food-images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'food-images');

DROP POLICY IF EXISTS "Public read charity-assets" ON storage.objects;
CREATE POLICY "Public read charity-assets" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'charity-assets');

DROP POLICY IF EXISTS "Users read own profile images" ON storage.objects;
CREATE POLICY "Users read own profile images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users write own profile images" ON storage.objects;
CREATE POLICY "Users write own profile images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own profile images" ON storage.objects;
CREATE POLICY "Users update own profile images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own profile images" ON storage.objects;
CREATE POLICY "Users delete own profile images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own chat attachments" ON storage.objects;
CREATE POLICY "Users read own chat attachments" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users write own chat attachments" ON storage.objects;
CREATE POLICY "Users write own chat attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);