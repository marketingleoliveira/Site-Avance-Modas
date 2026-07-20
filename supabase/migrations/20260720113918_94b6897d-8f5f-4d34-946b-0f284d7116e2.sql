CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DO $$
DECLARE
  pol record;
  using_expr text;
  check_expr text;
  sql text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE (qual LIKE '%has_role%' OR with_check LIKE '%has_role%')
      AND NOT (qual LIKE '%private.has_role%' OR with_check LIKE '%private.has_role%')
  LOOP
    using_expr := replace(pol.qual, 'has_role(', 'private.has_role(');
    check_expr := replace(pol.with_check, 'has_role(', 'private.has_role(');

    sql := format('ALTER POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    IF using_expr IS NOT NULL THEN
      sql := sql || format(' USING (%s)', using_expr);
    END IF;

    IF check_expr IS NOT NULL THEN
      sql := sql || format(' WITH CHECK (%s)', check_expr);
    END IF;

    EXECUTE sql;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;