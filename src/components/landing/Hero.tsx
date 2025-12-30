import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                Análise estatística avançada
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Mais critério estatístico.{" "}
              <span className="text-accent">Menos chute.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl">
              O MEGA FÁCIL analisa milhares de sorteios e gera combinações com
              melhor qualidade estatística, classificadas por score do modelo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <a href="#precos">
                  Gerar meu cartão analisado
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground italic">
              "Você decide o jogo. Os dados orientam."
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-sm">+10.000 sorteios analisados</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm">100% transparente</span>
              </div>
            </div>
          </div>

          {/* Right Content - Preview Card */}
          <div className="relative">
            <div className="glass-card rounded-2xl p-6 md:p-8 animate-float">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Combinação #1
                  </span>
                  <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
                    Score: 87%
                  </div>
                </div>

                {/* Lottery Balls - Blurred Preview */}
                <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                  <div className="lottery-ball-blur">??</div>
                  <div className="lottery-ball-primary">11</div>
                  <div className="lottery-ball-blur">??</div>
                  <div className="lottery-ball-primary">27</div>
                  <div className="lottery-ball-blur">??</div>
                  <div className="lottery-ball-primary">41</div>
                </div>

                <div className="h-px bg-border" />

                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Combinação com 2 números do Grupo A, 2 do Grupo B e 2 do
                    Grupo C.
                  </p>
                  <Button variant="cta" size="lg" className="w-full" asChild>
                    <a href="#precos">Desbloquear cartão (3 combinações)</a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
