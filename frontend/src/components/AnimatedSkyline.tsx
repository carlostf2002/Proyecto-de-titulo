// Fondo animado tematico para el login: un perfil de edificios cuyas ventanas se
// encienden y apagan de forma escalonada (evoca un condominio "inteligente" activo),
// mas capas de blobs con desenfoque (glassmorphism) y una grilla tipo "circuito" a la deriva.
// Puramente decorativo -> aria-hidden, y respeta prefers-reduced-motion via CSS global.

interface Edificio {
  x: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
}

const EDIFICIOS: Edificio[] = [
  { x: 0, width: 90, height: 220, cols: 3, rows: 7 },
  { x: 95, width: 70, height: 160, cols: 2, rows: 5 },
  { x: 170, width: 110, height: 280, cols: 4, rows: 9 },
  { x: 285, width: 80, height: 190, cols: 3, rows: 6 },
  { x: 370, width: 130, height: 320, cols: 4, rows: 10 },
  { x: 505, width: 75, height: 170, cols: 2, rows: 5 },
  { x: 585, width: 100, height: 240, cols: 3, rows: 8 },
  { x: 690, width: 85, height: 200, cols: 3, rows: 6 },
  { x: 780, width: 120, height: 260, cols: 4, rows: 8 },
];

const ANCHO_TOTAL = 900;
const ALTO_SVG = 340;

function ventanas(edificio: Edificio, indiceEdificio: number) {
  const items = [];
  const padding = 10;
  const gapX = (edificio.width - padding * 2) / edificio.cols;
  const gapY = (edificio.height - padding * 2) / edificio.rows;
  const winW = gapX * 0.55;
  const winH = gapY * 0.45;

  for (let r = 0; r < edificio.rows; r++) {
    for (let c = 0; c < edificio.cols; c++) {
      // Pseudo-aleatorio determinista para que el delay/duracion no cambien entre renders.
      const seed = (indiceEdificio + 1) * 31 + r * 7 + c * 13;
      const encendida = seed % 3 !== 0;
      const delay = (seed % 40) / 10; // 0 - 3.9s
      const duracion = 3 + (seed % 25) / 10; // 3 - 5.4s

      items.push(
        <rect
          key={`${r}-${c}`}
          x={edificio.x + padding + c * gapX}
          y={ALTO_SVG - edificio.height + padding + r * gapY}
          width={winW}
          height={winH}
          rx={1}
          className={encendida ? "fill-accent-300 animate-window-glow" : "fill-white/10"}
          style={encendida ? { animationDelay: `${delay}s`, animationDuration: `${duracion}s` } : undefined}
        />
      );
    }
  }
  return items;
}

export function AnimatedSkyline() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Cielo degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700" />

      {/* Grilla tipo circuito a la deriva */}
      <div
        className="absolute inset-0 opacity-[0.07] animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Blobs flotantes con desenfoque */}
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl animate-float" />
      <div className="absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl animate-float-slow" />
      <div className="absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-brand-300/20 blur-3xl animate-float" />

      {/* Skyline con ventanas encendidas */}
      <svg
        viewBox={`0 0 ${ANCHO_TOTAL} ${ALTO_SVG}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 h-[60%] w-full"
      >
        {EDIFICIOS.map((edificio, i) => (
          <g key={i}>
            <rect
              x={edificio.x}
              y={ALTO_SVG - edificio.height}
              width={edificio.width}
              height={edificio.height}
              className="fill-slate-950/60"
            />
            {ventanas(edificio, i)}
          </g>
        ))}
      </svg>

      {/* Velo para asegurar contraste con el formulario */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/40 to-brand-900/10" />
    </div>
  );
}
