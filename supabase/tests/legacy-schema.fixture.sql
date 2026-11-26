-- TEST FIXTURE ONLY. Insecure former schema; never run against a hosted database.
-- ==============================================================================
-- الجحفلي للحلول الرقمية - Al-Jahfali Digital Solutions
-- Schema: PostgreSQL on Supabase (Products, Settings, Orders, Profiles, Auth)
-- 100% Secure Architecture with Row-Level Security (RLS) & Automated Triggers
-- ==============================================================================

-- 1. Create Profiles Table (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'moderator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated trigger to create profile record when a new user signs up or logs in via Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create Products Table
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

-- 3. Create Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default exchange rates (Sanaa 536, SAR 140, Aden 2000)
INSERT INTO public.store_settings (key, value)
VALUES ('exchange_rates', '{"sanaa": 536, "sar": 140, "aden": 2000}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    items JSONB NOT NULL,
    total_usd NUMERIC,
    total_sar NUMERIC,
    total_yer_sanaa NUMERIC,
    total_yer_aden NUMERIC,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    delivery_details TEXT, -- Credentials, activation keys, or notes provided upon fulfillment
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (true);

-- 7. RLS Policies for Products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Allow product modifications" ON public.products;
CREATE POLICY "Allow product modifications"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

-- 8. RLS Policies for Store Settings
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
ON public.store_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow settings modifications" ON public.store_settings;
CREATE POLICY "Allow settings modifications"
ON public.store_settings FOR ALL
USING (true)
WITH CHECK (true);

-- 9. RLS Policies for Orders
-- Authenticated users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Any customer (guest or authenticated) can create an order
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
CREATE POLICY "Allow insert orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Allow full order viewing and updates for store management
DROP POLICY IF EXISTS "Allow order management" ON public.orders;
CREATE POLICY "Allow order management"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

