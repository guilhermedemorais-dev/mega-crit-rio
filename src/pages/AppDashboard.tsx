import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, Download, ArrowLeft, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Combination {
  numbers: number[];
  score: number;
  groupA: number;
  groupB: number;
  groupC: number;
}

const generateMockCombinations = (): Combination[] => {
  const combinations: Combination[] = [];
  for (let i = 0; i < 3; i++) {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 60) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);

    combinations.push({
      numbers,
      score: Math.floor(Math.random() * 25) + 75,
      groupA: 2,
      groupB: 2,
      groupC: 2,
    });
  }
  return combinations.sort((a, b) => b.score - a.score);
};

const AppDashboard = () => {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simular chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCombinations(generateMockCombinations());
    setHasGenerated(true);
    setIsGenerating(false);
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
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">MEGA FÁCIL</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Cartões disponíveis:</span>
            <span className="font-semibold text-accent">3</span>
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
                        Combinação #{index + 1}
                      </span>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`px-3 py-1 rounded-full bg-accent/10 text-sm font-semibold ${getScoreColor(
                              combo.score
                            )}`}
                          >
                            Score: {combo.score}%
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
                      Combinação com{" "}
                      <span className="font-medium text-accent">
                        {combo.groupA} números do Grupo A
                      </span>
                      ,{" "}
                      <span className="font-medium text-primary">
                        {combo.groupB} do Grupo B
                      </span>{" "}
                      e{" "}
                      <span className="font-medium text-muted-foreground">
                        {combo.groupC} do Grupo C
                      </span>
                      .
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
