-- Precomputed education / experience labels for the job list.
--
-- The frontend used to download every job's full description + requirements
-- (~40 MB for 13k jobs) only to derive these two badges/filters in the browser.
-- Stored generated columns compute them once on write, so the listing query can
-- skip the long text columns entirely.
--
-- Keyword rules mirror getEducationLevel / getExperienceLevel in src/utils/jobUtils.js
-- (text = description + requirements + title, lowercased). Keep both in sync.
-- Safe to run more than once.

alter table public.jobs
  add column if not exists education_level text generated always as (
    case
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%prepa%', '%vocacional%', '%bachillerato%', '%medio superior%'])
        then 'Preparatoria / Bachillerato'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%licenciatura%', '%profesional%'])
        then 'Licenciatura'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%ingeniería%', '%ingenieria%'])
        then 'Ingeniería'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%carrera técnica%', '%tecnico%', '%técnica%', '%técnico%'])
        then 'Carrera Técnica'
    end
  ) stored;

alter table public.jobs
  add column if not exists experience_level text generated always as (
    case
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%sin experiencia%', '%no requiere experiencia%', '%no necesaria%'])
        then 'Sin experiencia'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%6 meses%', '%medio año%'])
        then '6 meses de exp.'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%1 a 2 años%', '%1 - 2 años%', '%1 año%'])
        then '1 - 2 años de exp.'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%2 a 3 años%', '%2 - 3 años%', '%2 años%'])
        then '2 - 3 años de exp.'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%3 a 5 años%', '%3 - 5 años%', '%3 años%'])
        then '3+ años de exp.'
      when lower(coalesce(description, '') || ' ' || coalesce(requirements, '') || ' ' || coalesce(title, '')) like any (array['%5 años%', '%experiencia previa%'])
        then 'Experiencia requerida'
    end
  ) stored;

-- Tell PostgREST about the new columns right away.
notify pgrst, 'reload schema';
