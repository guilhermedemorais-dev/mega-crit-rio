import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { setStoredAuth } from "@/lib/auth";

interface LoginResponse {
  id: string;
  username: string;
  role: string;
  credits: number;
  api_key: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      toast({
        title: "Preencha os dados",
        description: "Informe usuário e senha para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL ??
        (import.meta.env.PROD ? "" : "http://localhost:8000");
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = payload?.detail ?? "Falha no login.";
        throw new Error(message);
      }

      const data = (await response.json()) as LoginResponse;
      setStoredAuth({
        userId: data.id,
        apiKey: data.api_key,
        role: data.role,
        username: data.username,
      });

      const redirectTo = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao autenticar.";
      toast({
        title: "Login inválido",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao site</span>
          </Link>
          <div className="flex items-center gap-2">
            <Logo className="h-7" />
          </div>
        </div>
      </header>

      <main className="flex-1 container flex items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Acesse o painel para gerar combinações com score do modelo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-sm text-muted-foreground text-center">
              Ainda não tem conta?{" "}
              <Link to="/register" className="text-accent hover:underline">
                Criar conta
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <p>
                Seu acesso é protegido por API key individual. O painel admin só
                é liberado para usuários com perfil administrador.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
