-- Add missing columns to profiles table to match Frontend
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS "civilStatus" TEXT,
ADD COLUMN IF NOT EXISTS "education" TEXT,
ADD COLUMN IF NOT EXISTS "lastJob" TEXT,
ADD COLUMN IF NOT EXISTS "lastPosition" TEXT,
ADD COLUMN IF NOT EXISTS "lastDuration" TEXT,
ADD COLUMN IF NOT EXISTS "photo" TEXT;
