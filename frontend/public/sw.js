// Service worker de HabitaSmart: solo maneja Web Push (mostrar la
// notificacion del sistema operativo y abrir la app al tocarla). No cachea
// nada ni funciona offline a proposito -- el objetivo es que llegue la
// alerta SOS (y el resto de notificaciones) aunque la pestaña este cerrada,
// no convertir esto en una PWA offline-first.

// Debe ser un archivo JS plano servido en la raiz (no puede importar nada
// del bundle de React: corre en un contexto separado del navegador). El
// mapa de rutas esta duplicado a proposito desde AppLayout.tsx
// (RUTA_POR_ENTIDAD) -- si se agrega una entidad nueva ahi, agregarla aca
// tambien.
const RUTA_POR_ENTIDAD = {
  Incidencia: "/incidencias",
  Multa: "/multas",
  Encomienda: "/encomiendas",
  Comunicado: "/comunicados",
  AlertaSos: "/alertas-sos",
};

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { titulo: "HabitaSmart", mensaje: event.data ? event.data.text() : "" };
  }

  const titulo = datos.titulo || "HabitaSmart";
  const opciones = {
    body: datos.mensaje || "",
    icon: "/icon-192.png",
    badge: "/icon-96.png",
    data: { entidadTipo: datos.entidadTipo, entidadId: datos.entidadId },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const entidadTipo = event.notification.data && event.notification.data.entidadTipo;
  const ruta = RUTA_POR_ENTIDAD[entidadTipo] || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if ("focus" in cliente) {
          if ("navigate" in cliente) cliente.navigate(ruta).catch(() => {});
          return cliente.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(ruta);
    })
  );
});
