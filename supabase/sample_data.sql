-- OPTIONAL — DEVELOPMENT ONLY. NOT REAL CLIENT DATA.
-- Creates clearly labelled DRAFT placeholders so you can try the admin panel.
-- They are 'draft', so they never appear on the public site. Delete before launch.
insert into public.categories (slug, name_en, name_ta, sort_order)
values ('sample-category', 'SAMPLE CATEGORY (draft data)', null, 99)
on conflict (slug) do nothing;

insert into public.products (slug, name_en, name_ta, price, pricing_unit, min_quantity, quantity_step, status, category_id)
select 'sample-product-1', 'SAMPLE PRODUCT 1 (not real)', null, 1.00, 'kg', 0.5, 0.5, 'draft', id
from public.categories where slug = 'sample-category'
on conflict (slug) do nothing;
