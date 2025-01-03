"use client";
import { usePathname } from "next/navigation";

const Breadcrumb: React.FC = () => {
  const pathname = usePathname(); // Obtiene la ruta actual
  const parts = pathname.split("/").filter((part) => part); // Divide la ruta en partes

  return (
    <nav className="text-sm breadcrumbs">
      <ol className="flex space-x-2">
        {parts.map((part, index) => {
          const href = "/" + parts.slice(0, index + 1).join("/"); // Genera el enlace acumulado
          const isLast = index === parts.length - 1;

          return (
            <li key={href} className="flex items-center">
              {!isLast ? (
                <div>
                  {part}
                </div>
              ) : (
                <span className=" capitalize">{part}</span>
              )}
              {!isLast && <span className="mx-1 text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;