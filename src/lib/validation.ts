import { z } from 'zod';

export const PilotoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  equipo: z.string().min(1, 'El equipo es requerido'),
  puntos: z.number().min(0, 'Los puntos no pueden ser negativos')
});

export const ResultadoSchema = z.object({
  id: z.string(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  pilotoId: z.string(),
  posicion: z.number().min(1, 'La posición debe ser mayor a 0'),
  puntos: z.number().min(0, 'Los puntos no pueden ser negativos'),
  vueltaRapida: z.boolean().optional()
});

export const EquipoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  pilotos: z.array(PilotoSchema),
  puntosTotales: z.number().min(0)
});

export type ValidatedPiloto = z.infer<typeof PilotoSchema>;
export type ValidatedResultado = z.infer<typeof ResultadoSchema>;
export type ValidatedEquipo = z.infer<typeof EquipoSchema>;
