// Fondo del login: skyline nocturno de condominio con parallax de 3 capas
// (lejana en bruma, media y cercana con ventanas encendidas) + brillo de
// horizonte y balizas de aviacion en las torres mas altas. Busca un look
// "premium" (fotografia de ciudad al atardecer) sin perder el nod literal al
// rubro. Puramente decorativo -> aria-hidden. Respeta prefers-reduced-motion
// via la regla global en index.css.

interface Edificio {
  x: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
  antena?: boolean;
  tanque?: boolean;
}

const ANCHO = 1000;

const LEJANA: { x: number; width: number; height: number }[] = [
  { x: -20, width: 90, height: 150 },
  { x: 65, width: 60, height: 110 },
  { x: 130, width: 100, height: 180 },
  { x: 235, width: 70, height: 130 },
  { x: 310, width: 120, height: 200 },
  { x: 440, width: 80, height: 140 },
  { x: 525, width: 95, height: 165 },
  { x: 630, width: 65, height: 115 },
  { x: 705, width: 110, height: 190 },
  { x: 825, width: 85, height: 145 },
  { x: 920, width: 100, height: 175 },
];

const MEDIA: Edificio[] = [
  { x: -10, width: 100, height: 210, cols: 3, rows: 6 },
  { x: 95, width: 75, height: 160, cols: 2, rows: 5 },
  { x: 180, width: 115, height: 250, cols: 3, rows: 7 },
  { x: 305, width: 85, height: 180, cols: 2, rows: 5 },
  { x: 400, width: 130, height: 280, cols: 4, rows: 8, tanque: true },
  { x: 545, width: 80, height: 170, cols: 2, rows: 5 },
  { x: 635, width: 105, height: 225, cols: 3, rows: 6 },
  { x: 755, width: 90, height: 190, cols: 2, rows: 5 },
  { x: 860, width: 120, height: 245, cols: 3, rows: 7 },
];

const CERCANA: Edificio[] = [
  { x: -30, width: 110, height: 260, cols: 3, rows: 8, tanque: true },
  { x: 90, width: 80, height: 190, cols: 2, rows: 6 },
  { x: 180, width: 135, height: 330, cols: 4, rows: 10, antena: true },
  { x: 325, width: 95, height: 215, cols: 3, rows: 7 },
  { x: 430, width: 70, height: 175, cols: 2, rows: 5 },
  { x: 510, width: 150, height: 360, cols: 5, rows: 11, antena: true },
  { x: 670, width: 100, height: 230, cols: 3, rows: 7, tanque: true },
  { x: 780, width: 85, height: 195, cols: 2, rows: 6 },
  { x: 875, width: 125, height: 290, cols: 4, rows: 9 },
];

function hashear(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

function ventanas(edificio: Edificio, indice: number, altoSvg: number, intensidad: number) {
  const items = [];
  const padding = 8;
  const gapX = (edificio.width - padding * 2) / edificio.cols;
  const gapY = (edificio.height - padding * 2) / edificio.rows;
  const winW = gapX * 0.5;
  const winH = gapY * 0.42;

  for (let r = 0; r < edificio.rows; r++) {
    for (let c = 0; c < edificio.cols; c++) {
      const seed = indice * 97 + r * 13 + c * 29 + 1;
      const azar = hashear(seed);
      if (azar > intensidad) continue;

      const esCalida = hashear(seed * 3.1) > 0.3;
      const delay = (hashear(seed * 5.7) * 5).toFixed(2);
      const duracion = (4 + hashear(seed * 8.3) * 4).toFixed(2);

      items.push(
        <rect
          key={`${r}-${c}`}
          x={edificio.x + padding + c * gapX}
          y={altoSvg - edificio.height + padding + r * gapY}
          width={winW}
          height={winH}
          rx={0.5}
          className={esCalida ? "fill-accent-300 animate-window-glow" : "fill-brand-200 animate-window-glow"}
          style={{ animationDelay: `${delay}s`, animationDuration: `${duracion}s` }}
        />
      );
    }
  }
  return items;
}

function techo(edificio: Edificio, altoSvg: number) {
  const topeY = altoSvg - edificio.height;
  const partes = [];

  if (edificio.antena) {
    const cx = edificio.x + edificio.width / 2;
    partes.push(
      <line
        key="antena"
        x1={cx}
        y1={topeY - 26}
        x2={cx}
        y2={topeY}
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-slate-700"
      />,
      <circle key="baliza" cx={cx} cy={topeY - 26} r={2.5} className="fill-red-400 animate-beacon-blink" />
    );
  }

  if (edificio.tanque) {
    partes.push(
      <rect
        key="tanque"
        x={edificio.x + edificio.width * 0.18}
        y={topeY - 10}
        width={edificio.width * 0.22}
        height={10}
        className="fill-slate-950/70"
      />
    );
  }

  return partes;
}

export function SkylineBackground() {
  return (
    <div className="skyline-ambient pointer-events-none absolute inset-0 overflow-hidden bg-[#070b18]" aria-hidden="true">
      {/* Cielo con profundidad sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1330] via-[#0a1024] to-[#05070f]" />

      {/* Brillo calido de horizonte (luces de ciudad reflejadas en el cielo) */}
      <div className="absolute bottom-[18%] left-1/2 h-[45vw] max-h-[420px] w-[70vw] max-w-[760px] -translate-x-1/2 animate-horizon-glow rounded-full bg-accent-500/20 blur-[100px]" />
      <div className="absolute bottom-[30%] right-[10%] h-[28vw] max-h-[260px] w-[28vw] max-w-[260px] animate-horizon-glow rounded-full bg-brand-500/15 blur-[90px] [animation-delay:3s]" />

      {/* Grilla muy sutil solo en el cielo (nod discreto a "smart building") */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] animate-grid-drift opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Capa lejana: siluetas en bruma, sin ventanas, da profundidad */}
      <svg
        viewBox={`0 0 ${ANCHO} 220`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 h-[42%] w-full opacity-40"
      >
        {LEJANA.map((e, i) => (
          <rect key={i} x={e.x} y={220 - e.height} width={e.width} height={e.height} className="fill-brand-900" />
        ))}
      </svg>

      {/* Capa media: siluetas mas definidas, ventanas dispersas */}
      <svg
        viewBox={`0 0 ${ANCHO} 300`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 h-[56%] w-full opacity-75"
      >
        {MEDIA.map((e, i) => (
          <g key={i}>
            <rect x={e.x} y={300 - e.height} width={e.width} height={e.height} className="fill-[#0c1226]" />
            {ventanas(e, i + 100, 300, 0.22)}
          </g>
        ))}
      </svg>

      {/* Capa cercana: skyline principal, ventanas ricas + detalles de azotea */}
      <svg
        viewBox={`0 0 ${ANCHO} 380`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 h-[68%] w-full"
      >
        {CERCANA.map((e, i) => (
          <g key={i}>
            <rect x={e.x} y={380 - e.height} width={e.width} height={e.height} className="fill-[#080c1a]" />
            {ventanas(e, i + 300, 380, 0.42)}
            {techo(e, 380)}
          </g>
        ))}
      </svg>

      {/* Grano fino: evita que el degradado se vea plano/digital */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
        <filter id="skyline-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#skyline-grain)" />
      </svg>

      {/* Vineta: asegura contraste legible alrededor de la tarjeta de login */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070f]/75 via-transparent to-[#05070f]/35" />
      {/* Oscurece la mitad izquierda, donde va el texto de marca en desktop,
          para que las ventanas iluminadas no le quiten legibilidad. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#05070f]/65 via-[#05070f]/15 to-transparent lg:block" />
    </div>
  );
}
