import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo className="h-10" />
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-sm">
              Ferramenta auxiliar de análise estatística para a Mega-Sena.
              Decisões baseadas em dados, não em suposições.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="#como-funciona" className="hover:text-primary-foreground transition-colors">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#precos" className="hover:text-primary-foreground transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-foreground transition-colors">
                  Área do cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h4 className="font-semibold mb-4">Administração</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/login" className="hover:text-primary-foreground transition-colors">
                  Painel Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          {/* Disclaimer */}
          <div className="bg-primary-foreground/10 rounded-lg p-4 mb-6">
            <p className="text-xs text-primary-foreground/80 text-center">
              <strong>Aviso importante:</strong> O MEGA FÁCIL é uma ferramenta
              auxiliar de análise estatística. Não garante prêmio nem altera a
              probabilidade real do sorteio. O score exibido refere-se
              exclusivamente ao modelo estatístico.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {new Date().getFullYear()} MEGA FÁCIL. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-primary-foreground transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
