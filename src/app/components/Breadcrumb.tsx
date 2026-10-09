"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/").filter((part) => part);

  const formatPart = (part: string) => {
    return part.charAt(0).toUpperCase() +
           part.slice(1).toLowerCase().replace(/-/g, " ");
  };

  const hrefFor = (index: number) => {
    if (index === 0) return "/";
    const part = parts[index];
    if (/^\d{4}$/.test(part)) return `/Campeonato/${part}/general`;
    return null; // season — current page
  };

  return (
    <nav aria-label="Ruta de navegación" className="text-sm py-4">
      <ol className="flex flex-wrap items-center gap-y-1">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          const href = isLast ? null : hrefFor(index);
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="crumb-sep" aria-hidden="true">›</span>}
              {href ? (
                <Link href={href} className="crumb">
                  {formatPart(part)}
                </Link>
              ) : (
                <span className="crumb current" aria-current={isLast ? "page" : undefined}>
                  {formatPart(part)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
