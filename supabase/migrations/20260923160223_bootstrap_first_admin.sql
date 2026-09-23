-- Primeiro administrador do painel Avance Modas.
DO $$
BEGIN
  IF to_regclass('public.user_roles') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.user_roles não existe';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = '6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid
    AND role::text <> 'admin';

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = '6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid
      AND role::text = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('6ccd8a11-d91b-448b-9f57-2b52cbde3b6d'::uuid, 'admin');
  END IF;
END
$$;
