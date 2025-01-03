"use client";
import { mockPilots } from "@/data/mockData"; // Ajusta esta importación a tu archivo de datos
import Image from "next/image";
import { notFound, useParams } from "next/navigation";

const PilotoPage =  ( ) => {
  const { id } = useParams(); 
  const piloto = mockPilots.find(
    (p) => p.kartNumber.toString() === id
  );

  if (!piloto) {
    notFound(); // Manejo del error 404 si no encuentra el piloto
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{piloto?.name}</h1>
      <Image src={piloto?.profileUrl} alt={piloto?.name} className="w-48 h-64" />
      <p className="mt-4 text-gray-700">{piloto?.biography || "No biography available."}</p>
      <p className="mt-2">
        <strong>Kart Number:</strong> {piloto?.kartNumber}
      </p>
      <p>
        <strong>Team:</strong> {piloto?.teamName}
      </p>
      <p>
        <strong>Country:</strong> {piloto?.country}
      </p>
      <p>
        <strong>Categories:</strong> {piloto?.categories.join(", ")}
      </p>
    </div>
  );
};

export default PilotoPage;