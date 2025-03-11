export interface Piloto {
  id: string;
  nombre: string;
  equipo: string;
  puntos: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  pilotos: Piloto[];
  puntosTotales: number;
}

export interface Resultado {
  id: string;
  fecha: string;
  pilotoId: string;
  posicion: number;
  puntos: number;
  vueltaRapida?: boolean;
}

export interface Campeonato {
  id: string;
  nombre: string;
  temporada: string;
  fechas: string[];
  resultados: Resultado[];
}
