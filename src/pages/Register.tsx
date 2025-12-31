import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

interface RegisterResponse {
  id: string;
  username: string;
  role: string;
  credits: number;
  api_key: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password.length < 6) {
      toast({
        title: "Senha fraca",
        description: "Use pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "Confirme a senha corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL ??
        (import.meta.env.PROD ? "" : "http://localhost:8000");
      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = payload?.detail ?? "Falha no cadastro.";
        throw new Error(message);
      }

      const data = (await response.json()) as RegisterResponse;
      setStoredAuth({
        userId: data.id,
        apiKey: data.api_key,
        role: data.role,
        username: data.username,
      });

      navigate("/app", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar.";
      toast({
        title: "Cadastro falhou",
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
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Cadastre-se para acessar seu painel de combinações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-4 text-sm text-muted-foreground text-center">
              Já tem conta?{" "}
              <Link to="/login" className="text-accent hover:underline">
                Entrar
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <p>
                Sua conta recebe uma API key interna para gerar combinações com
                score do modelo.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Register;
