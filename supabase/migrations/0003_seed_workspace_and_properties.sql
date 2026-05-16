-- Seed workspace
insert into workspaces (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Tabodis')
on conflict (id) do nothing;

-- Seed properties (5 from current landing)
insert into properties (workspace_id, slug, title, description, price, type, city, loc, bedrooms, bathrooms, m2, features, status, featured, published_at) values
  ('00000000-0000-0000-0000-000000000001', 'villa-con-vista-al-mar-altea', 'Villa con vista al mar', 'Espectacular villa con vistas panorámicas al mediterráneo, jardín y piscina infinita.', 1245000, 'venta', 'Altea', 'Altea, Alicante', 5, 4, 420, ARRAY['Piscina','Vistas al mar','Garaje','Jardín'], 'live', true, now()),
  ('00000000-0000-0000-0000-000000000001', 'apartamento-minimalista-valencia', 'Apartamento minimalista', 'Apartamento de diseño en pleno centro de Valencia, totalmente reformado con acabados premium.', 395000, 'venta', 'Valencia', 'Centro, Valencia', 2, 2, 95, ARRAY['Aire acond.','Ascensor','Terraza'], 'live', false, now()),
  ('00000000-0000-0000-0000-000000000001', 'adosado-mediterraneo-calpe', 'Adosado mediterráneo', 'Adosado a 5 minutos de la playa con jardín privado y zona común con piscina.', 2400, 'alquiler', 'Calpe', 'Calpe, Alicante', 3, 2, 165, ARRAY['Jardín','Piscina','Garaje'], 'live', false, now()),
  ('00000000-0000-0000-0000-000000000001', 'loft-urbano-de-lujo-madrid', 'Loft urbano de lujo', 'Loft de diseño en el barrio de Malasaña, alturas, iluminación natural y acabados de lujo.', 1620000, 'lujo', 'Madrid', 'Malasaña, Madrid', 1, 1, 78, ARRAY['Aire acond.','Ascensor'], 'live', false, now()),
  ('00000000-0000-0000-0000-000000000001', 'casa-de-campo-javea', 'Casa de campo', 'Casa de campo con amplio jardín, piscina y vistas a la montaña en Jávea.', 880000, 'venta', 'Jávea', 'Jávea, Alicante', 4, 3, 280, ARRAY['Jardín','Piscina','Garaje','Vistas al mar'], 'live', false, now())
on conflict (workspace_id, slug) do nothing;

-- Seed approved reviews (4 testimonials)
insert into reviews (workspace_id, author_name, city, rating, services, body, status) values
  ('00000000-0000-0000-0000-000000000001', 'Carlos R. S.', 'Alicante', 5, ARRAY['Inmobiliaria','Gestión'], 'Absolutamente recomendable en todos los sentidos. Una mujer entregada en cuerpo y alma a su trabajo, que siempre está para lo que se necesite.', 'approved'),
  ('00000000-0000-0000-0000-000000000001', 'Anna K.', 'Valencia', 5, ARRAY['Inmobiliaria','Extranjería','Gestión'], 'Encontré mi casa, mi NIE y mi gestoría con una sola persona. Tatiana literalmente me devolvió meses de mi vida.', 'approved'),
  ('00000000-0000-0000-0000-000000000001', 'Marco L.', 'Madrid', 5, ARRAY['Inmobiliaria'], 'Profesional, rigurosa y discreta. Hicimos la operación más importante de nuestra vida con la tranquilidad de saber que todo estaba revisado.', 'approved'),
  ('00000000-0000-0000-0000-000000000001', 'Elena P.', 'Murcia', 4, ARRAY['Extranjería'], 'El nivel de atención al detalle es algo que no se ve a menudo en este sector. Volvería a confiar sin dudarlo.', 'approved');
