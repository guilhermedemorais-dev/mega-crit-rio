import { Check, Database, Eye, Users, Zap } from "lucide-react";

const benefits = [
  {
    icon: Database,
    text: "Escolha guiada por dados reais",
  },
  {
    icon: Zap,
    text: "Evita combinações estatisticamente fracas",
  },
  {
    icon: Users,
    text: "Ideal para jogos individuais ou bolão",
  },
  {
    icon: Eye,
    text: "Transparência total da lógica",
  },
];

const ValueProposition = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title text-foreground mb-4">
              Por que usar o MEGA FÁCIL?
            </h2>
            <p className="section-subtitle mx-auto">
              Estratégia não garante sorte, mas evita jogar no escuro.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-foreground font-medium">
                    {benefit.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
