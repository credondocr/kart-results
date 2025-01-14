"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Contenido principal del footer */}
        <div className="flex flex-wrap justify-between">
          {/* Información general */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-3">Costa Rica Kart Championship</h3>
            <p className="text-gray-400">
              Bienvenido a Costa Rica Kart Championship. ¡Compite, sigue resultados y celebra las victorias!
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-3">Enlaces Rápidos</h3>
            <ul className="text-gray-400">
              <li className="mb-2">
                <Link href="/equipos" className="hover:text-white">
                  Equipos
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/temporadas" className="hover:text-white">
                  Temporadas
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/reglamento" className="hover:text-white">
                  Reglamento
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-3">Síguenos</h3>
            <ul className="flex space-x-4">
              <li>
                <a
                  href="https://www.facebook.com/ACEKCR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400"
                >
                  <i className="fab fa-facebook-f"></i> Facebook
                </a>
              </li>
              
              <li>
                <a
                  href="https://www.instagram.com/acekkartismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400"
                >
                  <i className="fab fa-instagram"></i> Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/channel/UC6yXqyJ5ms7XfxaIpgZ0TFg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400"
                >
                  <i className="fab fa-youtube"></i> YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea de separación */}
        <div className="border-t border-gray-700 mt-6 pt-4">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Costa Rica Kart Championship. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;