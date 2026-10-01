import { useCallback, useEffect, useState } from "react";
import { activarPush, desactivarPush, obtenerSuscripcionActual, pushSoportado } from "../lib/push";

export function usePushNotifications() {
  const soportado = pushSoportado();
  const [habilitado, setHabilitado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!soportado) {
      setListo(true);
      return;
    }
    obtenerSuscripcionActual()
      .then((s) => setHabilitado(!!s))
      .finally(() => setListo(true));
  }, [soportado]);

  const activar = useCallback(async () => {
    setCargando(true);
    try {
      await activarPush();
      setHabilitado(true);
    } finally {
      setCargando(false);
    }
  }, []);

  const desactivar = useCallback(async () => {
    setCargando(true);
    try {
      await desactivarPush();
      setHabilitado(false);
    } finally {
      setCargando(false);
    }
  }, []);

  return { soportado, habilitado, cargando, listo, activar, desactivar };
}
