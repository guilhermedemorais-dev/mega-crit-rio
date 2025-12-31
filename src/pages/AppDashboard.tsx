import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth";
import Logo from "@/components/Logo";
import { RefreshCw, Download, ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiCombination {
  numeros: number[];
  score: number;
  explicacao: string;
}

interface ApiCard {
  id: string;
  combinacoes: ApiCombination[];
}

interface UiCombination {
  numbers: number[];
  score: number;
  explanation: string;
  cardId: string;
  cardIndex: number;
  comboIndex: number;
}

const getUserId = () => {
  const key = "mega_facil_user_id";
  const stored = getStoredAuth();
  if (stored?.userId) return stored.userId;
  const envUserId = import.meta.env.VITE_DEFAULT_USER_ID as string | undefined;
  if (envUserId) {
    localStorage.setItem(key, envUserId);
    return envUserId;
  }
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(key, newId);
  return newId;
};

const getApiKey = () => {
  const envApiKey = import.meta.env.VITE_API_KEY as string | undefined;
  if (envApiKey) return envApiKey;
  return localStorage.getItem("mega_facil_api_key") ?? undefined;
};

const AppDashboard = () => {
  const navigate = useNavigate();
  const [combinations, setCombinations] = useState<UiCombination[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [cardsCount, setCardsCount] = useState(1);

  const handleLogout = () => {
    clearStoredAuth();
    navigate("/login");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL ??
        (import.meta.env.PROD ? "" : "http://localhost:8000");
      const apiKey = getApiKey();
      const response = await fetch(`${apiBase}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "X-Api-Key": apiKey } : {}),
        },
        body: JSON.stringify({
          cartoes: cardsCount,
          user_id: getUserId(),
          pagamento_confirmado: true,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          payload?.detail ?? "Não foi possível gerar combinações agora.";
        throw new Error(message);
      }

      const data = (await response.json()) as { cartoes: ApiCard[] };
      const nextCombinations = data.cartoes.flatMap((card, cardIndex) =>
        card.combinacoes.map((combo, comboIndex) => ({
          numbers: combo.numeros,
          score: combo.score,
          explanation: combo.explicacao,
          cardId: card.id,
          cardIndex,
          comboIndex,
        }))
      );

      setCardsCount(data.cartoes.length || cardsCount);
      setCombinations(nextCombinations.sort((a, b) => b.score - a.score));
      setHasGenerated(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao gerar combinações.";
      toast({
        title: "Falha na geração",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-accent";
    if (score >= 75) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Logo className="h-7" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Cartões disponíveis:</span>
              <span className="font-semibold text-accent">{cardsCount}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Seu cartão estatístico
            </h1>
            <p className="text-muted-foreground">
              Gere combinações analisadas pelo modelo estatístico
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-10">
            <Button
              variant="cta"
              size="xl"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Gerar novo cartão
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          {!hasGenerated && (
            <div className="bg-secondary/50 rounded-xl p-6 text-center max-w-lg mx-auto">
              <Info className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                O que é o Score do Modelo?
              </h3>
              <p className="text-sm text-muted-foreground">
                O score indica o quão forte é a combinação segundo nosso modelo
                estatístico. Combinações com scores mais altos utilizam números
                com melhor histórico de recorrência.
              </p>
            </div>
          )}

          {/* Combinations */}
          {hasGenerated && (
            <div className="space-y-6">
              {combinations.map((combo, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border p-6 hover:shadow-elevated transition-all animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Cartão {combo.cardIndex + 1} • Combinação{" "}
                        {combo.comboIndex + 1}
                      </span>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`px-3 py-1 rounded-full bg-accent/10 text-sm font-semibold ${getScoreColor(
                              combo.score
                            )}`}
                          >
                            Score do Modelo: {combo.score}%
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Score baseado no modelo estatístico
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Exportar
                    </Button>
                  </div>

                  {/* Numbers */}
                  <div className="flex justify-center gap-3 md:gap-4 flex-wrap mb-4">
                    {combo.numbers.map((num, numIndex) => (
                      <div key={numIndex} className="lottery-ball-primary">
                        {num.toString().padStart(2, "0")}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {combo.explanation}
                    </p>
                  </div>
                </div>
              ))}

              {/* Educational Note */}
              <div className="bg-secondary/30 rounded-xl p-5 text-center">
                <p className="text-sm text-muted-foreground italic">
                  "Estratégia não garante sorte, mas evita jogar no escuro."
                </p>
              </div>

              {/* Disclaimer */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground text-center">
                  O MEGA FÁCIL é uma ferramenta auxiliar de análise estatística.
                  Não garante prêmio nem altera a probabilidade real do sorteio.
                  O score exibido refere-se exclusivamente ao modelo estatístico.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppDashboard;
