-- Default settings row. The tagline is taken from the official logo.
-- The WhatsApp number is deliberately left empty: set it in /admin/settings.
insert into public.site_settings (id, tagline_en, tagline_ta)
values (1, 'From our soil to your home', 'எங்கள் மண்ணில் இருந்து உங்கள் இல்லத்துக்கு')
on conflict (id) do nothing;
