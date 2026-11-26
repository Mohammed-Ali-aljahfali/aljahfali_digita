-- Apply after 202611250001_secure_store.sql. No customer conversation is stored.
BEGIN;

CREATE TABLE IF NOT EXISTS public.assistant_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 2 AND 160),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 10 AND 12000),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assistant_articles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.assistant_articles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.assistant_articles TO anon, authenticated;
GRANT INSERT(title,body,published), UPDATE(title,body,published) ON public.assistant_articles TO authenticated;
DROP POLICY IF EXISTS assistant_article_read ON public.assistant_articles;
CREATE POLICY assistant_article_read ON public.assistant_articles FOR SELECT TO anon, authenticated
  USING (published OR public.is_admin());
DROP POLICY IF EXISTS assistant_article_insert ON public.assistant_articles;
CREATE POLICY assistant_article_insert ON public.assistant_articles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS assistant_article_update ON public.assistant_articles;
CREATE POLICY assistant_article_update ON public.assistant_articles FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP TRIGGER IF EXISTS assistant_article_audit ON public.assistant_articles;
CREATE TRIGGER assistant_article_audit BEFORE INSERT OR UPDATE ON public.assistant_articles
  FOR EACH ROW EXECUTE FUNCTION public.store_touch_and_audit();

-- Only opaque digests and counters; never messages, tokens, user IDs or raw IPs.
CREATE TABLE IF NOT EXISTS public.assistant_rate_limits (
  bucket text NOT NULL,
  window_seconds integer NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 1 CHECK (hits > 0),
  PRIMARY KEY (bucket, window_seconds, window_start)
);
CREATE INDEX IF NOT EXISTS assistant_rate_expiry ON public.assistant_rate_limits(window_start);
ALTER TABLE public.assistant_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.assistant_rate_limits FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.assistant_take_rate_limit(p_bucket text,p_limit integer,p_window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_start timestamptz; v_hits integer;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) NOT BETWEEN 8 AND 180 OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 10000
     OR p_window_seconds IS NULL OR p_window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'INVALID_ASSISTANT_LIMIT';
  END IF;
  v_start=to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds)*p_window_seconds);
  DELETE FROM public.assistant_rate_limits WHERE window_start < now()-interval '2 days';
  INSERT INTO public.assistant_rate_limits AS limits(bucket,window_seconds,window_start,hits)
  VALUES(p_bucket,p_window_seconds,v_start,1)
  ON CONFLICT(bucket,window_seconds,window_start) DO UPDATE SET hits=limits.hits+1
    WHERE limits.hits<p_limit
  RETURNING hits INTO v_hits;
  RETURN v_hits IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.assistant_take_rate_limit(text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assistant_take_rate_limit(text,integer,integer) TO service_role;

INSERT INTO public.store_schema_migrations(version) VALUES('202611260001_store_assistant') ON CONFLICT DO NOTHING;
COMMIT;
