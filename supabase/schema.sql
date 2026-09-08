-- ============================================================================
-- Aalaya Vastra — Production database schema
-- Run this ONCE in Supabase Dashboard → SQL Editor → New Query → Run.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING throughout.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADMIN ALLOWLIST
-- Only users whose auth.users id appears in this table can write to the
-- store tables below. Creating a Supabase Auth account is NOT enough on its
-- own — you must also add a row here (see bottom of this file).
-- ----------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

drop policy if exists "admin_users self read" on admin_users;
create policy "admin_users self read" on admin_users
  for select using (auth.uid() = id);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- 1B. CUSTOMER PROFILES
-- Synchronized automatically with auth.users on signup/login.
-- Stores customer name, phone, email, and saved addresses.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  addresses jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles public self read" on profiles;
create policy "profiles public self read" on profiles
  for select using (auth.uid() = id or is_admin());

drop policy if exists "profiles public self write" on profiles;
create policy "profiles public self write" on profiles
  for all using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());

-- Auto-insert profile row whenever a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, profiles.full_name),
      email = coalesce(excluded.email, profiles.email),
      phone = coalesce(excluded.phone, profiles.phone),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  sku text,
  category text not null,
  subcategory text,
  price numeric not null default 0,
  old_price numeric,
  cost_price numeric,
  discount text,
  stock integer not null default 0,
  fabric text,
  material text,
  occasion text,
  care_instructions text,
  sizes text[] not null default '{}',
  description text,
  image text,
  images text[] not null default '{}',
  video text,
  video_url text,
  rating numeric default 4.5,
  reviews_count integer default 0,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);

alter table products enable row level security;

drop policy if exists "products public read" on products;
create policy "products public read" on products for select using (true);

drop policy if exists "products admin write" on products;
create policy "products admin write" on products for all
  using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  image text,
  banner_image text,
  item_count text,
  featured boolean not null default true,
  active boolean not null default true,
  subcategories text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "categories public read" on categories;
create policy "categories public read" on categories for select using (true);

drop policy if exists "categories admin write" on categories;
create policy "categories admin write" on categories for all
  using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 4. BANNERS
-- ----------------------------------------------------------------------------
create table if not exists banners (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  image text not null,
  link text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;

drop policy if exists "banners public read" on banners;
create policy "banners public read" on banners for select using (true);

drop policy if exists "banners admin write" on banners;
create policy "banners admin write" on banners for all
  using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 5. COUPONS
-- ----------------------------------------------------------------------------
create table if not exists coupons (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  discount_value numeric not null,
  min_order numeric not null default 0,
  max_discount numeric,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table coupons enable row level security;

drop policy if exists "coupons public read" on coupons;
create policy "coupons public read" on coupons for select using (true);

drop policy if exists "coupons admin write" on coupons;
create policy "coupons admin write" on coupons for all
  using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 6. ORDERS
-- Customers (anon) may only INSERT their own order — never read/update/delete.
-- Only admins can view or change fulfillment status.
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address text not null,
  city text,
  state text,
  pincode text,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  delivery_charge numeric not null default 0,
  total_amount numeric not null default 0,
  payment_method text,
  payment_status text not null default 'Pending',
  status text not null default 'Pending',
  coupon_code text,
  created_at timestamptz not null default now()
);

-- Optional column for Razorpay payment reference ID
alter table orders add column if not exists payment_id text;

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_status on orders(status);

alter table orders enable row level security;

drop policy if exists "orders public insert" on orders;
create policy "orders public insert" on orders for insert with check (true);

drop policy if exists "orders admin read" on orders;
create policy "orders admin read" on orders for select using (is_admin());

drop policy if exists "orders admin update" on orders;
create policy "orders admin update" on orders for update
  using (is_admin()) with check (is_admin());

drop policy if exists "orders admin delete" on orders;
create policy "orders admin delete" on orders for delete using (is_admin());

-- Customer "My Orders" lookup — there's no real per-customer login (the
-- storefront account system is a demo OTP, not Supabase Auth), so RLS can't
-- key off auth.uid() for shoppers. This function returns only rows matching
-- the phone number the caller supplies, which is far narrower than exposing
-- the whole table to the anon key. It's still phone-guessable in principle;
-- that's an accepted tradeoff at this store's scale without real customer auth.
create or replace function get_orders_by_phone(p_phone text)
returns setof orders
language sql
stable
security definer
set search_path = public
as $$
  select * from orders where customer_phone = p_phone order by created_at desc;
$$;

grant execute on function get_orders_by_phone(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7. CONTACT MESSAGES
-- ----------------------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created_at on contact_messages(created_at desc);

alter table contact_messages enable row level security;

drop policy if exists "contact_messages public insert" on contact_messages;
create policy "contact_messages public insert" on contact_messages for insert with check (true);

drop policy if exists "contact_messages admin read" on contact_messages;
create policy "contact_messages admin read" on contact_messages for select using (is_admin());

drop policy if exists "contact_messages admin update" on contact_messages;
create policy "contact_messages admin update" on contact_messages for update
  using (is_admin()) with check (is_admin());

drop policy if exists "contact_messages admin delete" on contact_messages;
create policy "contact_messages admin delete" on contact_messages for delete using (is_admin());

-- ----------------------------------------------------------------------------
-- 8. SETTINGS (singleton row)
-- ----------------------------------------------------------------------------
create table if not exists settings (
  id smallint primary key default 1 check (id = 1),
  store_name text,
  phone text,
  email text,
  whatsapp text,
  owner_name text,
  address text,
  free_shipping_threshold numeric not null default 2000,
  gstin text,
  currency text not null default '₹',
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

drop policy if exists "settings public read" on settings;
create policy "settings public read" on settings for select using (true);

drop policy if exists "settings admin write" on settings;
create policy "settings admin write" on settings for all
  using (is_admin()) with check (is_admin());

-- ----------------------------------------------------------------------------
-- 9. updated_at auto-touch triggers
-- ----------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function touch_updated_at();

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at
  before update on settings
  for each row execute function touch_updated_at();

-- ============================================================================
-- 10. SEED DATA — carries over what's currently hardcoded in the app so the
-- storefront isn't empty the moment it switches from localStorage to Supabase.
-- ============================================================================
insert into categories (id, name, tagline, description, image, banner_image, item_count, featured, subcategories) values
  ('sarees', 'Sarees', 'Timeless Weaves & Elegant Drapes', 'Banarasi Tissue, Petiti Work, Manipuri Kota, Tassar with Gold & Silver lines, Mangalagiri Pattu, and Checks Silk Sarees.', '/products/saree-placeholder.png', '/products/saree-placeholder.png', '6 Collections', true, array['Banarasi Tissue','Banarasi Petiti Work','Manipuri Kota','Tassar (Gold & Silver Lines)','Mangalagiri Pattu Digital Print','Checks Silk']),
  ('dresses', 'Dresses', 'Modern & Everyday Ethnic Wear', 'Mulchanderi 3-piece sets with embroidery, A-Line dresses, and pure cotton Jandani frocks and 3-piece sets.', '/products/dress-placeholder.png', '/products/dress-placeholder.png', '4 Collections', true, array['Mulchanderi 3-Piece Embroidery','Mulchanderi 3-Piece A-Line','Jandani Pure Cotton Frock','Jandani Pure Cotton 3-Piece Set']),
  ('fabrics', 'Fabrics', 'Quality Unstitched Fabric Pieces', 'Premium unstitched silk, tissue, and mulchanderi fabric pieces for custom tailoring.', '/products/generic-product.png', '/products/generic-product.png', 'Custom Cut Pieces', true, array['Pure Silk Fabric','Tissue Cut Pieces','Mulmul Cotton','Chanderi Fabric']),
  ('blouse-pieces', 'Blouse Pieces', 'Designer Matching Blouse Fabrics', 'Embroidered and zari-work blouse pieces to perfectly complement your saree.', '/products/generic-product.png', '/products/generic-product.png', 'Matching Cuts', true, array['Embroidered Blouses','Heavy Zari Work','Cotton Cut Pieces']),
  ('new-arrivals', 'New Arrivals', 'Freshly Curated Ethnic Styles', 'Discover our newest Banarasi weaves, Mulchanderi dress sets, and seasonal releases.', '/products/saree-placeholder.png', '/products/saree-placeholder.png', 'Just Added', true, array['Banarasi Tissue','Mulchanderi Sets','Jandani Frocks'])
on conflict (id) do nothing;

insert into products (id, name, category, subcategory, price, old_price, discount, is_new, is_featured, rating, reviews_count, image, images, description, stock, fabric) values
  ('av-sar-01', 'Banarasi Tissue Saree', 'sarees', 'Banarasi Tissue', 2499, 3499, '29% OFF', true, true, 4.8, 12, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Banarasi Tissue'),
  ('av-sar-02', 'Banarasi Petite Work Saree', 'sarees', 'Banarasi', 2699, 3799, '29% OFF', true, true, 4.7, 9, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Banarasi'),
  ('av-sar-03', 'Manipuri Kota Saree', 'sarees', 'Manipuri Kota', 1899, 2599, '27% OFF', true, false, 4.6, 7, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Kota'),
  ('av-sar-04', 'Tassar Saree with Gold & Silver Lines', 'sarees', 'Tassar', 2199, 2999, '27% OFF', true, true, 4.8, 14, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Tassar Silk'),
  ('av-sar-05', 'Mangalagiri Pattu Digital Print Saree', 'sarees', 'Mangalagiri Pattu', 1699, 2299, '26% OFF', true, false, 4.5, 6, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Mangalagiri Pattu'),
  ('av-sar-06', 'Checks Silk Saree', 'sarees', 'Checks Silk', 1999, 2799, '29% OFF', false, false, 4.6, 8, '/products/saree-placeholder.png', array['/products/saree-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Silk'),
  ('av-dr-01', 'Mulchanderi 3-Piece Dress with Embroidery (A-Line)', 'dresses', 'Mulchanderi Sets', 1799, 2499, '28% OFF', true, true, 4.7, 10, '/products/dress-placeholder.png', array['/products/dress-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Mulchanderi'),
  ('av-dr-02', 'Mulchanderi 3-Piece Dress (A-Line)', 'dresses', 'Mulchanderi Sets', 1499, 2099, '29% OFF', true, false, 4.6, 5, '/products/dress-placeholder.png', array['/products/dress-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Mulchanderi'),
  ('av-dr-03', 'Jandani Frock - Pure Cotton', 'dresses', 'Jandani Cotton', 999, 1399, '29% OFF', true, true, 4.8, 11, '/products/dress-placeholder.png', array['/products/dress-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Pure Cotton'),
  ('av-dr-04', 'Jandani 3-Piece Set - Pure Cotton', 'dresses', 'Jandani Cotton', 1299, 1799, '28% OFF', false, false, 4.5, 4, '/products/dress-placeholder.png', array['/products/dress-placeholder.png'], 'Placeholder listing — awaiting real photos, price, and description from client.', 10, 'Pure Cotton')
on conflict (id) do nothing;

insert into banners (id, title, image, link, active, sort_order) values
  ('b1', 'Banarasi Silk Sarees', '/slider/image copy 2.png', '/shop?category=sarees', true, 1),
  ('b2', 'Festive Dress Collection', '/slider/image copy 3.png', '/shop?category=dresses', true, 2)
on conflict (id) do nothing;

insert into coupons (id, code, type, discount_value, min_order, max_discount, active) values
  ('c1', 'AV10', 'percentage', 10, 1999, 500, true),
  ('c2', 'WELCOME500', 'fixed', 500, 2999, null, true)
on conflict (id) do nothing;

insert into settings (id, store_name, phone, email, whatsapp, owner_name, address, free_shipping_threshold, gstin, currency) values
  (1, 'Aalaya Vastra', '9999999999', 'contact@aalayavastra.com', '9999999999', 'Owner', 'Rajahmundry, Andhra Pradesh', 2000, '37AAAAA0000A1Z5', '₹')
on conflict (id) do nothing;

-- ============================================================================
-- 11. LAST STEP — grant yourself admin access (do this manually, once):
--
--   1. Go to Authentication → Users → Add user (create your own email + password).
--   2. Copy that user's UUID.
--   3. Run:
--        insert into admin_users (id, email) values ('<paste-uuid-here>', '<your-email>');
--
-- Until you do this, you can log in at /admin/login but every write will be
-- rejected by RLS (is_admin() returns false) — that's expected and correct.
-- ============================================================================
