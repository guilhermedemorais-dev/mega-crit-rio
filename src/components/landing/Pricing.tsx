import { Button } from "@/components/ui/button";
import { Check, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <section id="precos" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground mb-4">
            Escolha seu cartão estatístico
          </h2>
          <p className="section-subtitle mx-auto">
            Quanto mais combinações você joga, maior sua cobertura estatística.
            Por isso, muitos usuários usam o MEGA FÁCIL para montar bolões.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic Card */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-accent/30 hover:shadow-elevated transition-all">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                1 Cartão
              </h3>
              <p className="text-sm text-muted-foreground">
                3 combinações estatísticas
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">R$ 6</span>
              <span className="text-muted-foreground">,00</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />3 combinações ranqueadas
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Score do modelo
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Explicação detalhada
              </li>
            </ul>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/app">Comprar cartão</Link>
            </Button>
          </div>

          {/* Popular Card */}
          <div className="relative bg-card rounded-2xl border-2 border-accent p-6 shadow-elevated">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                Mais popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                5 Cartões
              </h3>
              <p className="text-sm text-muted-foreground">
                15 combinações estatísticas
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">R$ 25</span>
              <span className="text-muted-foreground">,00</span>
              <span className="ml-2 text-sm text-accent font-medium">
                Economize R$ 5
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                15 combinações ranqueadas
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Score do modelo
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Explicação detalhada
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Ideal para bolão
              </li>
            </ul>

            <Button variant="cta" className="w-full" asChild>
              <Link to="/app">Comprar cartões</Link>
            </Button>
          </div>

          {/* Bolão Card */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-accent/30 hover:shadow-elevated transition-all">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">
                  10 Cartões
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                30 combinações estatísticas
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">R$ 45</span>
              <span className="text-muted-foreground">,00</span>
              <span className="ml-2 text-sm text-accent font-medium">
                Economize R$ 15
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                30 combinações ranqueadas
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Score do modelo
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Explicação detalhada
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" />
                Perfeito para grandes bolões
              </li>
            </ul>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/app">Comprar cartões</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
