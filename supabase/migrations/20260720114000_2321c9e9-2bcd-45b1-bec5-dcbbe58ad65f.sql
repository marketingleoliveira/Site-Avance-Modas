DO $$
DECLARE
  pol record;
  using_expr text;
  check_expr text;
  sql text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE (coalesce(qual, '') LIKE '%has_role%' OR coalesce(with_check, '') LIKE '%has_role%')
      AND (coalesce(qual, '') NOT LIKE '%private.has_role%' OR coalesce(with_check, '') NOT LIKE '%private.has_role%')
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