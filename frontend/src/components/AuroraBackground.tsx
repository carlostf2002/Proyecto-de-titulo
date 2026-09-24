// Fondo del login: gradiente "aurora" (mesh gradient fluido, estilo SaaS premium
// tipo Stripe/Linear) sobre una grilla sutil tipo plano arquitectonico -- nod
// discreto al rubro (condominios/edificios) sin recurrir a iconografia literal.
// Puramente decorativo -> aria-hidden. Las animaciones respetan
// prefers-reduced-motion via la regla global en index.css.
export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#070b18]" aria-hidden="true">
      {/* Base con profundidad sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1330] via-[#070b18] to-[#05070f]" />

      {/* Blobs de gradiente fluido, mezclados en "screen" para el efecto aurora
          (las zonas donde se superponen brillan mas, como luces del norte). */}
      <div className="absolute -left-1/4 -top-1/4 h-[60vw] max-h-[720px] w-[60vw] max-w-[720px] animate-aurora-a rounded-full bg-brand-500/40 mix-blend-screen blur-[110px]" />
      <div className="absolute -right-1/4 top-1/4 h-[55vw] max-h-[660px] w-[55vw] max-w-[660px] animate-aurora-b rounded-full bg-accent-500/30 mix-blend-screen blur-[110px]" />
      <div className="absolute -bottom-1/4 left-1/4 h-[50vw] max-h-[600px] w-[50vw] max-w-[600px] animate-aurora-c rounded-full bg-violet-500/25 mix-blend-screen blur-[110px]" />

      {/* Grilla tipo plano arquitectonico, deriva lenta */}
      <div
        className="absolute inset-0 animate-grid-drift opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Grano fino: evita que el gradiente se vea plano/digital */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay">
        <filter id="aurora-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aurora-grain)" />
      </svg>

      {/* Vineta: asegura contraste legible alrededor de la tarjeta de login */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070f]/70 via-transparent to-[#05070f]/40" />
    </div>
  );
}
