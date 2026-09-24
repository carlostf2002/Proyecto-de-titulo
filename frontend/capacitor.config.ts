import type { CapacitorConfig } from '@capacitor/cli';

// El backend sirve API + frontend desde un solo proceso Express (ver npm run
// serve), asi que la app apunta directo a esa direccion en vez de empaquetar
// el build offline: mismo origen, sin tocar el baseURL relativo "/api" de
// axios ni lidiar con CORS. Mientras se prueba en un celular fisico, debe ser
// una IP de la red local alcanzable desde el telefono (mismo Wi-Fi que este
// PC); al desplegar el backend a internet, cambiar esta URL a esa direccion
// publica (idealmente https, para no necesitar cleartext en el manifest).
const config: CapacitorConfig = {
  appId: 'cl.habitasmart.app',
  appName: 'HabitaSmart',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.84:4000',
    cleartext: true,
  },
};

export default config;
