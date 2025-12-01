-- Allow admins to update any profile (needed for role migration)
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to delete users if needed (optional but good for management)
CREATE POLICY "Admins can delete any profile"
ON profiles
FOR DELETE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
