import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Resultado, Piloto, Equipo } from '@/types';

interface ResultsState {
  resultados: Resultado[];
  pilotos: Piloto[];
  equipos: Equipo[];
  isLoading: boolean;
  error: Error | null;
}

type Action =
  | { type: 'SET_RESULTADOS'; payload: Resultado[] }
  | { type: 'SET_PILOTOS'; payload: Piloto[] }
  | { type: 'SET_EQUIPOS'; payload: Equipo[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

const initialState: ResultsState = {
  resultados: [],
  pilotos: [],
  equipos: [],
  isLoading: false,
  error: null,
};

const ResultsContext = createContext<{
  state: ResultsState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function resultsReducer(state: ResultsState, action: Action): ResultsState {
  switch (action.type) {
    case 'SET_RESULTADOS':
      return { ...state, resultados: action.payload };
    case 'SET_PILOTOS':
      return { ...state, pilotos: action.payload };
    case 'SET_EQUIPOS':
      return { ...state, equipos: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resultsReducer, initialState);

  return (
    <ResultsContext.Provider value={{ state, dispatch }}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
}
