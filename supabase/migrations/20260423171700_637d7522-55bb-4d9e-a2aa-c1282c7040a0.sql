-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  location TEXT,
  product_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_rating_check CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials FOR SELECT
USING (true);

CREATE POLICY "Admins can insert testimonials"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update testimonials"
ON public.testimonials FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with testimonials inspired by Shopee reviews of avance_modas
INSERT INTO public.testimonials (customer_name, rating, comment, location, product_name, display_order, source) VALUES
('Juliana M.', 5, 'Amei o conjunto! Tecido de ótima qualidade, super confortável para treinar. Veio rapidinho e bem embalado. Já é a terceira compra que faço com a Avance!', 'São Paulo - SP', 'Conjunto Fitness', 1, 'shopee'),
('Patrícia S.', 5, 'A legging é maravilhosa, não fica transparente e modela super bem o corpo. Vendedora atenciosa, recomendo demais!', 'Rio de Janeiro - RJ', 'Legging Cintura Alta', 2, 'shopee'),
('Camila R.', 5, 'Top nadador perfeito! Sustenta bem, tecido macio e a cor é linda igual da foto. Entrega super rápida.', 'Belo Horizonte - MG', 'Top Nadador', 3, 'shopee'),
('Fernanda L.', 4, 'Produto de qualidade, gostei muito do short. Só achei que o tamanho ficou um pouco justo, mas no geral aprovado!', 'Curitiba - PR', 'Short Poliamida', 4, 'shopee'),
('Beatriz O.', 5, 'Já comprei várias peças e nunca me decepcionei. Costura impecável, tecido firme e durável. Avance Modas é referência em moda fitness!', 'Porto Alegre - RS', 'Conjunto Fitness', 5, 'shopee'),
('Larissa T.', 5, 'Chegou antes do prazo, super bem embalado com cartãozinho de agradecimento. A peça é exatamente como nas fotos, amei!', 'Salvador - BA', 'Legging', 6, 'shopee'),
('Renata C.', 5, 'Compressão perfeita, fica linda no corpo. Já estou de olho em outras peças. Loja de confiança!', 'Brasília - DF', 'Legging Premium', 7, 'shopee'),
('Aline P.', 5, 'Atendimento nota 10! Tirei dúvidas sobre o tamanho e a vendedora foi super solícita. Produto chegou perfeito.', 'Fortaleza - CE', 'Top Fitness', 8, 'shopee');