-- 1. Tabela Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Trigger para criar profile no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Tabela Pages
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    path TEXT NOT NULL,
    icon TEXT
);

-- Popula Pages
INSERT INTO public.pages (id, label, path) VALUES 
('admin_emails', 'Leads / Emails', '/admin/emails'),
('studio_diagnostico', 'Usuários Diagnóstico', '/studio/usuarios-diagnostico'),
('leads_prospector', 'Leads Prospector', '/leads-prospector')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela Page Buttons
CREATE TABLE IF NOT EXISTS public.page_buttons (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    page_id TEXT REFERENCES public.pages(id) ON DELETE CASCADE
);

-- 4. User Page Access
CREATE TABLE IF NOT EXISTS public.user_page_access (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    page_id TEXT REFERENCES public.pages(id) ON DELETE CASCADE,
    can_access BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, page_id)
);

-- 5. User Button Access
CREATE TABLE IF NOT EXISTS public.user_button_access (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    button_id TEXT NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, button_id)
);

-- 6. User Permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL,
    level TEXT DEFAULT 'viewer',
    PRIMARY KEY (user_id, permission_id)
);

-- RLS (Exemplo simplificado)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_button_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Leitura por autenticados
CREATE POLICY "Leitura pública autenticada" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leitura pública autenticada" ON public.pages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leitura pública autenticada" ON public.page_buttons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Leitura própria" ON public.user_page_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leitura própria" ON public.user_button_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leitura própria" ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);

-- Escrita restrita a admin
CREATE POLICY "Admin pode tudo" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
-- (Adicionar policies similares para outras tabelas)
