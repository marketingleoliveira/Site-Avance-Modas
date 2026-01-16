-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Policy para usuários verem suas próprias roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Tabela para configurações de design do site
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Todos podem ler as configurações (para exibir o site)
CREATE POLICY "Anyone can read settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas admins podem modificar
CREATE POLICY "Admins can modify settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('hero_atacado', '{"image_url": "", "title": "Atacado Avance", "subtitle": "Preços especiais para revendedores", "promo_text": "ATÉ 30% OFF", "promo_subtitle": "ATACADO", "button_text": "COMPRE AGORA"}'),
('hero_varejo', '{"image_url": "", "title": "Varejo Avance", "subtitle": "Moda fitness de qualidade", "promo_text": "ATÉ 20% OFF", "promo_subtitle": "NOVIDADES", "button_text": "COMPRE AGORA"}'),
('store_selector', '{"atacado_image": "", "varejo_image": "", "background_image": ""}'),
('features', '{"items": [{"icon": "truck", "title": "Frete Grátis", "description": "acima de R$279"}, {"icon": "percent", "title": "5% Desconto", "description": "no Pix"}, {"icon": "tag", "title": "Cupom Primeira Compra", "description": "PRIMEIRACOMPRA"}, {"icon": "credit-card", "title": "Pague com cartão", "description": "em até 6x s/ juros"}, {"icon": "refresh", "title": "Primeira Troca", "description": "Frete Grátis"}]}');

-- Criar bucket de storage para imagens do site
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

-- Policy para upload de imagens (apenas admins)
CREATE POLICY "Admins can upload site images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- Policy para leitura pública das imagens
CREATE POLICY "Anyone can view site images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-images');

-- Policy para admins deletarem imagens
CREATE POLICY "Admins can delete site images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- Policy para admins atualizarem imagens
CREATE POLICY "Admins can update site images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
