"use client";

import React from "react";
import { Championships  } from "@/data/history";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    if (Championships.years.length > 0) {
      // Obtener el último año disponible
      const latestYear = Championships.years
        .map((champ) => parseInt(champ.year, 10)) // Convertir a número
        .sort((a, b) => b - a)[0]; 

      // Redirigir a /Campeonato/{latestYear}/general
      router.push(`/Campeonato/${latestYear}/general`);
    }
  }, [router]);

  return (
    <div>
     
    </div>
  );
};

export default HomePage;