CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled QR',
  qr_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  encoded_value TEXT NOT NULL,
  style JSONB NOT NULL DEFAULT '{}'::jsonb,
  short_code TEXT NOT NULL UNIQUE,
  is_dynamic BOOLEAN NOT NULL DEFAULT true,
  target_url TEXT,
  scan_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX qr_codes_user_id_idx ON public.qr_codes (user_id);
CREATE INDEX qr_codes_short_code_idx ON public.qr_codes (short_code);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_codes TO service_role;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their QR codes" ON public.qr_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can create QR codes" ON public.qr_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their QR codes" ON public.qr_codes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete their QR codes" ON public.qr_codes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_type TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT
);
CREATE INDEX qr_scans_qr_id_idx ON public.qr_scans (qr_id, scanned_at DESC);
GRANT SELECT ON public.qr_scans TO authenticated;
GRANT ALL ON public.qr_scans TO service_role;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view scans of their QR codes" ON public.qr_scans FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.qr_codes c WHERE c.id = qr_scans.qr_id AND c.user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER qr_codes_set_updated_at BEFORE UPDATE ON public.qr_codes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can read their own qr files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'qr-files' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can upload to their own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'qr-files' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update their own qr files" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'qr-files' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete their own qr files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'qr-files' AND (storage.foldername(name))[1] = auth.uid()::text
);