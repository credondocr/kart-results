import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/acek.png"
              alt="ACEK"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-display font-black uppercase tracking-tight text-white text-base leading-none">
              Costa Rica <span className="text-[#4C8DFF]">Kart</span> Championship
            </span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9BA3BD]">
            <Link href="/" className="hover:text-white transition-colors">Campeonato</Link>
            <Link href="/equipos" className="hover:text-white transition-colors">Equipos</Link>
            <Link href="/palmares" className="hover:text-white transition-colors">Palmarés</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/reglamento" className="hover:text-white transition-colors">Reglamento</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center sm:text-left text-xs text-[#9BA3BD]">
          © {year} ACEK — Asociación Costarricense de Karting
        </div>
      </div>
    </footer>
  );
};

export default Footer;
