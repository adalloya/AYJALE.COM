-- 1. Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone;

-- 2. Update the handle_new_user function to include terms data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, terms_accepted, terms_accepted_at)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'role', 
    new.raw_user_meta_data->>'name',
    (new.raw_user_meta_data->>'terms_accepted')::boolean,
    (new.raw_user_meta_data->>'terms_accepted_at')::timestamp with time zone
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
