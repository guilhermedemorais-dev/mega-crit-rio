import { BarChart2, Layers, Shuffle, Target } from "lucide-react";

const steps = [
  {
    icon: BarChart2,
    number: "1",
    title: "Análise Estatística",
    description:
      "O sistema analisa o histórico da Mega-Sena e mede a recorrência dos números ao longo do tempo.",
  },
  {
    icon: Layers,
    number: "2",
    title: "Classificação por Grupos",
    description: (
      <>
        Cada número é classificado em grupos estatísticos:
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            <span className="font-semibold text-accent">Grupo A</span> – Top 20%
            (números mais fortes)
          </li>
          <li>
            <span className="font-semibold text-primary">Grupo B</span> – Top
            50%
          </li>
          <li>
            <span className="font-semibold text-muted-foreground">
              Grupo C
            </span>{" "}
            – Top 80%
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: Shuffle,
    number: "3",
    title: "Combinação Inteligente",
    description:
      "As combinações são geradas misturando números dos grupos A, B e C, evitando extremos e mantendo equilíbrio estatístico.",
  },
  {
    icon: Target,
    number: "4",
    title: "Score do Modelo",
    description:
      "Cada combinação recebe um score percentual que indica o quão forte ela é segundo o modelo estatístico.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground mb-4">Como funciona</h2>
          <p className="section-subtitle mx-auto">
            Entenda o processo por trás das nossas combinações estatísticas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative bg-card rounded-xl p-6 border border-border hover:border-accent/30 hover:shadow-elevated transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <step.icon className="w-6 h-6 text-accent" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <div className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
