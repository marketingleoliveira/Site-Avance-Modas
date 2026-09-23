DO $$
BEGIN
  IF to_regclass('public.user_roles') IS NULL THEN
    RAISE EXCEPTION 'A tabela public.user_roles não existe';
  END IF;
END
$$;

-- Garante que o usuário possui somente a função administrativa.
DELETE FROM public.user_roles
WHERE user_id = '6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid
  AND role::text <> 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT '6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid, 'admin'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = '6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid
    AND role::text = 'admin'
);

-- Permissões mínimas necessárias para o painel consultar a função.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- O usuário autenticado pode consultar somente as próprias permissões.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'authenticated_read_own_roles'
  ) THEN
    CREATE POLICY authenticated_read_own_roles
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Libera execução das funções has_role existentes.
DO $$
DECLARE
  function_signature regprocedure;
BEGIN
  FOR function_signature IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'has_role'
  LOOP
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %s TO authenticated',
      function_signature
    );
  END LOOP;
END
$$;
