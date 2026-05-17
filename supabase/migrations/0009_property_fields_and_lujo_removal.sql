-- Property fields expansion + Lujo category removal (2026-05-17).
-- 1) Delete all properties of type 'lujo' (user-confirmed).
-- 2) Tighten the type CHECK constraint to (venta, alquiler) only.
-- 3) Add structured fields: building_type, floor, total_floors, orientation,
--    energy_certificate (each constrained by CHECK to keep data consistent).
-- 4) Add location_radius_m for privacy-aware map display on the public site.

-- ─── 1. Drop existing 'lujo' rows ─────────────────────────────────────────────
delete from properties where type = 'lujo';

-- ─── 2. Replace the type CHECK constraint ─────────────────────────────────────
alter table properties drop constraint properties_type_check;
alter table properties
  add constraint properties_type_check
  check (type = any (array['venta'::text, 'alquiler'::text]));

-- ─── 3. New structured property columns ───────────────────────────────────────
alter table properties
  add column building_type text
    check (building_type is null or building_type = any (array[
      'apartamento','casa','villa','atico','adosado','estudio','duplex','parte_casa'
    ])),
  add column floor int,
  add column total_floors int,
  add column orientation text
    check (orientation is null or orientation = any (array[
      'N','S','E','O','NE','NO','SE','SO'
    ])),
  add column energy_certificate text
    check (energy_certificate is null or energy_certificate = any (array[
      'A','B','C','D','E','F','G','en_tramite','exento'
    ]));

-- ─── 4. Privacy radius (metres) for approximate map display ───────────────────
alter table properties
  add column location_radius_m int default 300
    check (location_radius_m is null or (location_radius_m >= 0 and location_radius_m <= 50000));
