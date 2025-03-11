import type { Resultado, Piloto, Equipo } from '@/types';

export function calcularPuntosPiloto(resultados: Resultado[], pilotoId: string): number {
  return resultados
    .filter(r => r.pilotoId === pilotoId)
    .reduce((total, r) => total + r.puntos, 0);
}

export function ordenarPilotos(pilotos: Piloto[]): Piloto[] {
  return [...pilotos].sort((a, b) => b.puntos - a.puntos);
}

export function calcularPuntosEquipo(equipo: Equipo, resultados: Resultado[]): number {
  return equipo.pilotos.reduce((total, piloto) => 
    total + calcularPuntosPiloto(resultados, piloto.id), 0);
}

export function ordenarEquipos(equipos: Equipo[]): Equipo[] {
  return [...equipos].sort((a, b) => b.puntosTotales - a.puntosTotales);
}
