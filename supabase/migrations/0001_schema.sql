-- Nilaamudhu Traditional Products — core schema
-- Run in order: 0001_schema.sql, 0002_rls_and_storage.sql, 0003_default_settings.sql

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.pricing_unit as enum ('kg', 'g', 'litre', 'piece', 'pack');
create type public.stock_status as enum ('in_stock', 'limited', 'out_of_stock');
create type public.product_status as enum ('draft', 'active', 'archived');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin users. Rows are created ONLY by the project owner in the SQL editor.
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null check (char_length(name_en) between 1 and 120),
  name_ta text check (name_ta is null or char_length(name_ta) <= 120),
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_active_sort_idx on public.categories (is_active, sort_order);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories (id) on delete set null,
  name_en text not null check (char_length(name_en) between 1 and 160),
  name_ta text check (name_ta is null or char_length(name_ta) <= 160),
  short_description_en text check (short_description_en is null or char_length(short_description_en) <= 300),
  short_description_ta text check (short_description_ta is null or char_length(short_description_ta) <= 300),
  description_en text,
  description_ta text,
  ingredients_en text,
  ingredients_ta text,
  storage_en text,
  storage_ta text,
  -- Base price per pricing_unit. Null when the product is sold only through package options.
  price numeric(10, 2) check (price is null or price >= 0),
  pricing_unit public.pricing_unit not null default 'kg',
  min_quantity numeric(10, 3) not null default 1 check (min_quantity > 0),
  quantity_step numeric(10, 3) not null default 1 check (quantity_step > 0),
  max_quantity numeric(10, 3) not null default 100 check (max_quantity > 0),
  stock_status public.stock_status not null default 'in_stock',
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_sort_idx on public.products (status, sort_order);
create index products_category_idx on public.products (category_id);
create index products_featured_idx on public.products (is_featured) where is_featured;
create index products_name_en_trgm on public.products using gin (name_en gin_trgm_ops);
create index products_name_ta_trgm on public.products using gin (name_ta gin_trgm_ops);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Product images (files live in the 'product-images' storage bucket)
-- ---------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  alt_en text,
  alt_ta text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Package sizes / variants (each one is a distinct purchasable option)
-- ---------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label_en text not null check (char_length(label_en) between 1 and 80),
  label_ta text check (label_ta is null or char_length(label_ta) <= 80),
  price numeric(10, 2) not null check (price >= 0),
  stock_status public.stock_status not null default 'in_stock',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1). Contains only information that is public by nature.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  business_name_en text not null default 'Nilaamudhu Traditional Products',
  business_name_ta text not null default 'நிலாமுது',
  tagline_en text,
  tagline_ta text,
  announcement_en text,
  announcement_ta text,
  about_en text,
  about_ta text,
  quality_en text,
  quality_ta text,
  -- Digits only, with country code, e.g. 919876543210 (no +, spaces or dashes)
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{8,15}$'),
  contact_phone text,
  contact_email text,
  address_en text,
  address_ta text,
  instagram_url text,
  facebook_url text,
  currency_symbol text not null default '₹',
  default_language text not null default 'en' check (default_language in ('en', 'ta')),
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
