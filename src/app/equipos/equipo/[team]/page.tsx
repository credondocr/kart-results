"use client";
import { useParams } from "next/navigation";
import { Drivers } from "@/data/drivers/data"; // Ajusta la ruta según corresponda
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import Link from "next/link";

const TeamPage = () => {
  const { team } = useParams(); // Obtener el parámetro dinámico "team" de la URL

  // Filtrar los pilotos que pertenecen al equipo seleccionado
  const teamPilots = Drivers.filter(
    (pilot) => pilot.teamLogo.toLowerCase() === team?.toString().toLowerCase()
  );

  if (!teamPilots.length) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Equipo no encontrado</h1>
        <p className="mt-4">No hay pilotos registrados para este equipo.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-center mb-6">Equipo: {team}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {teamPilots.map((pilot) => (
          <div
            key={pilot.kartNumber}
            className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-center mb-4">
              <Image
                src={pilot.profileUrl + ".png"}
                alt={pilot.name}
                width={200}
                height={200}
                className="rounded"
                
              />
            </div>
            <Link href={`/equipos/equipo/${pilot.teamLogo}/${pilot.kartNumber}`}>
            <h2 className="text-lg font-semibold text-center text-black">{pilot.name}</h2>
            </Link>
            
            <p className="text-center text-sm text-gray-600">
              Kart #: {pilot.kartNumber}
            </p>
            <p className="text-center text-sm text-gray-600">
              Categoría: {pilot.categories.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPage;