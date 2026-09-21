import { useCallback, useEffect, useState } from "react";
import { mensajeError } from "../api/client";

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(() => {
    setCargando(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { data, cargando, error, recargar, setData };
}
