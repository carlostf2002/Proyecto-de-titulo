import { pushApi } from "../api/endpoints";

// La clave publica VAPID viaja en base64url; la Push API del navegador
// (applicationServerKey) la quiere como Uint8Array. Conversion estandar,
// no hay forma mas corta sin una libreria aparte solo para esto.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// En iPhone/iPad todos los navegadores usan el motor de Safari, y Safari solo
// expone la Push API (iOS 16.4+) cuando la app se abre desde un acceso
// "Agregar a inicio" -- en una pestaña normal PushManager simplemente no existe.
export function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function abiertaComoApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function pushSoportado(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function obtenerSuscripcionActual(): Promise<PushSubscription | null> {
  if (!pushSoportado()) return null;
  const registro = await navigator.serviceWorker.getRegistration();
  if (!registro) return null;
  return registro.pushManager.getSubscription();
}

// Flujo completo: pide permiso, registra el service worker, se suscribe al
// servicio de push del navegador y manda la suscripcion al backend. Lanza
// con un mensaje legible si algo falla en cualquier paso (permiso denegado,
// navegador sin soporte, backend sin claves VAPID configuradas).
export async function activarPush(): Promise<void> {
  if (!pushSoportado()) {
    throw new Error("Este navegador no soporta notificaciones push.");
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    throw new Error("Diste permiso denegado para las notificaciones. Puedes habilitarlo desde los ajustes del navegador.");
  }

  const { publicKey } = await pushApi.vapidPublicKey();
  if (!publicKey) {
    throw new Error("El servidor todavia no tiene las notificaciones push configuradas.");
  }

  const registro = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let suscripcion = await registro.pushManager.getSubscription();
  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const json = suscripcion.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("No se pudo crear la suscripcion de notificaciones.");
  }

  await pushApi.suscribir({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
}

export async function desactivarPush(): Promise<void> {
  const suscripcion = await obtenerSuscripcionActual();
  if (!suscripcion) return;
  const endpoint = suscripcion.endpoint;
  await suscripcion.unsubscribe();
  await pushApi.eliminar(endpoint).catch(() => {});
}
