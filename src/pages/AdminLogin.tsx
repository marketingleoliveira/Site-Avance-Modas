import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import RouteSEO from "@/components/seo/RouteSEO";
import logoAvance from "@/assets/logo-avance.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  // Check if already logged in as admin on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if user is admin
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          if (roleData) {
            console.log('Already logged in as admin, redirecting...');
            navigate("/admin", { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in
      const { error: signInError, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (signInError) {
        toast.error("Erro ao fazer login", {
          description: signInError.message,
        });
        setLoading(false);
        return;
      }

      if (!data.user) {
        toast.error("Erro ao fazer login", {
          description: "Usuário não encontrado",
        });
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking role:', roleError);
        toast.error("Erro ao verificar permissões");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!roleData) {
        toast.error("Acesso negado", {
          description: "Você não tem permissão de administrador.",
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success - redirect to admin panel
      toast.success("Login realizado com sucesso!");
      navigate("/admin", { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erro inesperado ao fazer login");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <RouteSEO title="Login Admin | Avance Modas" description="Acesso restrito ao painel administrativo." path="/admin/login" noindex />
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="text-center mb-8">
            <img 
              src={logoAvance} 
              alt="Avance Modas" 
              className="h-16 mx-auto mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-2">
              Acesse para gerenciar o design do site
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@avancemodas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
