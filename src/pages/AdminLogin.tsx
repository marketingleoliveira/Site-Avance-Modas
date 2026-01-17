import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoAvance from "@/assets/logo-avance.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Sign up flow
      const redirectUrl = `${window.location.origin}/admin`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast.error("Erro ao criar conta", {
          description: error.message,
        });
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!", {
        description: "Você já pode fazer login.",
      });
      setIsSignUp(false);
      setLoading(false);
      return;
    }

    // Sign in flow
    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Erro ao fazer login", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate("/admin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
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
              {isSignUp ? "Crie sua conta de administrador" : "Acesse para gerenciar o design do site"}
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
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (isSignUp ? "Criando..." : "Entrando...") : (isSignUp ? "Criar Conta" : "Entrar")}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-accent hover:underline"
            >
              {isSignUp ? "Já tem conta? Faça login" : "Primeira vez? Crie sua conta"}
            </button>
            <div>
              <a href="/" className="text-sm text-muted-foreground hover:text-primary">
                ← Voltar para o site
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
