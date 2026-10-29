"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dedupePorNombre, type PreRegistro } from "./data";

const POLL_MS = 45_000;

type Store = {
  submissions: PreRegistro[];
  loading: boolean;
  error: boolean;
  refetch: () => Promise<PreRegistro[]>;
};

const Ctx = createContext<Store>({
  submissions: [],
  loading: true,
  error: false,
  refetch: async () => [],
});

export function useLatinoamericano() {
  return useContext(Ctx);
}

/**
 * Fuente única de pre-registros para la página: fetch inicial + polling suave.
 * Todos los hijos (ticker, contador, muros, formulario) consumen este contexto
 * en vez de golpear Google Sheets por separado.
 */
export default function LatinoamericanoStore({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<PreRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alive = useRef(true);

  const load = useCallback(async (): Promise<PreRegistro[]> => {
    try {
      const res = await fetch("/api/latinoamericano/registrations", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { submissions?: PreRegistro[] };
      const deduped = dedupePorNombre(
        (data.submissions ?? []).filter((s) => s.nombre)
      );
      if (alive.current) {
        setSubmissions(deduped);
        setError(false);
      }
      return deduped;
    } catch {
      if (alive.current) setError(true);
      return [];
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  const value = useMemo(
    () => ({ submissions, loading, error, refetch: load }),
    [submissions, loading, error, load]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
