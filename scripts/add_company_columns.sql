-- Add new columns to profiles table if they don't exist
alter table profiles add column if not exists rfc text;
alter table profiles add column if not exists recruiter_name text;
alter table profiles add column if not exists phone_number text;
-- industry and location might already exist, but ensuring they are there
alter table profiles add column if not exists industry text;
alter table profiles add column if not exists location text;
-- address is already in some schemas, but ensuring it
alter table profiles add column if not exists address text;
