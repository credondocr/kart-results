"use client";
import { usePathname } from "next/navigation";

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const parts = pathname.split("/").filter((part) => part);

  const formatPart = (part: string) => {
    return part.charAt(0).toUpperCase() + 
           part.slice(1).toLowerCase().replace(/-/g, " ");
  };

  return (
    <nav className="text-sm py-4">
      <ol className="flex items-center">
        {parts.map((part, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            <span className={`text-gray-600 dark:text-gray-400 ${index === parts.length - 1 ? 'font-medium' : ''}`}>
              {formatPart(part)}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;