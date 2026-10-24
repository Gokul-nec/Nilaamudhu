-- Row Level Security + Storage policies

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.site_settings enable row level security;

-- admin_users: a signed-in user may only see their own row. No client writes at all.
create policy "admin_users: read own row" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- categories
create policy "categories: public reads active" on public.categories
  for select to anon, authenticated using (is_active);
create policy "categories: admin full access" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products
create policy "products: public reads active" on public.products
  for select to anon, authenticated using (status = 'active');
create policy "products: admin full access" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product images
create policy "product_images: public reads images of active products" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_images: admin full access" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- variants
create policy "product_variants: public reads active variants of active products" on public.product_variants
  for select to anon, authenticated
  using (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "product_variants: admin full access" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site settings
create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings: admin insert" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "site_settings: admin update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: one public-read bucket, admin-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "product-images: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product-images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
