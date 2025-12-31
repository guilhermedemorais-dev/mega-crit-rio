import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo = ({ className, alt = "MEGA FACIL" }: LogoProps) => {
  return (
    <img
      src="/imagem/logo-mega-facil.png"
      alt={alt}
      className={cn("h-8 w-auto", className)}
      loading="eager"
    />
  );
};

export default Logo;
