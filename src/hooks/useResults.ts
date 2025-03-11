import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import type { Resultado } from '@/types';

export function useResults(campeonatoId?: string) {
  const [results, setResults] = useState<Resultado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const endpoint = campeonatoId 
          ? `/resultados?campeonato=${campeonatoId}`
          : '/resultados';
        const data = await ApiService.get<Resultado[]>(endpoint);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [campeonatoId]);

  return { results, isLoading, error };
}
