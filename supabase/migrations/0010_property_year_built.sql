-- Año de construcción for properties.
-- Bounded 1800–2100 so admin typos (e.g. 19200) don't break the public UI.
-- NULL = unknown / not provided.

alter table properties
  add column if not exists year_built int
    check (
      year_built is null
      or (year_built >= 1800 and year_built <= 2100)
    );

comment on column properties.year_built is
  'Year the building was constructed (Spanish: año de construcción). NULL when unknown.';
