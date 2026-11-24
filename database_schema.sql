-- ================================================================
-- الجحفلي للحلول الرقمية - Al-Jahfali Digital Solutions
-- Supabase PostgreSQL Schema for Products, Settings & Orders
-- ================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    raw_name TEXT,
    title TEXT NOT NULL,
    service_key TEXT,
    service_name TEXT,
    category TEXT,
    brand_color TEXT,
    brand_gradient TEXT,
    brand_label TEXT,
    icon TEXT,
    is_guaranteed BOOLEAN DEFAULT true,
    warranty_text TEXT,
    warranty_policy TEXT,
    duration TEXT,
    stock INTEGER DEFAULT 0,
    sold INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    prices JSONB NOT NULL,
    card_desc TEXT,
    modal_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Store Settings Table (Exchange rates, etc.)
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Exchange Rates
INSERT INTO public.store_settings (key, value)
VALUES ('exchange_rates', '{"sanaa": 536, "sar": 140, "aden": 2000}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL,
    total_usd NUMERIC,
    total_sar NUMERIC,
    total_yer_sanaa NUMERIC,
    total_yer_aden NUMERIC,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Policies
-- Allow public read access to products & settings so visitors can view the store
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Allow public read active products"
ON public.products FOR SELECT
USING (is_active = true);

-- Public can read store settings
CREATE POLICY "Allow public read settings"
ON public.store_settings FOR SELECT
USING (true);

-- Public can insert orders
CREATE POLICY "Allow public insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Allow full access for anon/authenticated (controlled by Admin Key / Password in dashboard)
CREATE POLICY "Allow anon update products"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon update settings"
ON public.store_settings FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon read orders"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);
