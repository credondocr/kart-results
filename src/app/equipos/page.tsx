import Image from "next/image";
import Link from "next/link";


const teams = [
  { name: "Formula Kart - FIK", logo: "/logos/fik.png", link: "/equipos/equipo/fik" },
  { name: "Advanced Karting", logo: "/logos/advanced.png", link: "/equipos/equipo/advanced" },
  { name: "Babyliss Pro - MMR", logo: "/logos/losprimos.png", link: "/equipos/equipo/losprimos" },
  { name: "FMV", logo: "/logos/fmv.png", link: "/equipos/equipo/fmv" },
  { name: "MH Karting", logo: "/logos/mhkarting.png", link: "/equipos/equipo/mhkarting" },
  { name: "Valerio Racing System", logo: "/logos/valerio.png", link: "/equipos/equipo/valerio" },
];

const PilotosPage = () => {
  return (
    <div className="container mx-auto p-4">
      
      <h1 className="text-3xl font-bold text-center mb-6">Equipos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link key={team.name} href={team.link} className="group">
            <div className="bg-black p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-4">
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
              <h2 className="text-xl font-semibold text-center group-hover:text-gray-600">
                {team.name}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PilotosPage;