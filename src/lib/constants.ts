// Constantes globales de la aplicación
export const APP_CONFIG = {
  siteName: 'Kart Results',
  description: 'Sistema de resultados de karting',
  apiEndpoints: {
    campeonato: '/api/campeonato',
    equipos: '/api/equipos',
    resultados: '/api/resultados'
  }
} as const;

export const ROUTES = {
  home: '/',
  campeonato: '/campeonato',
  equipos: '/equipos',
  reglamento: '/reglamento'
} as const;
