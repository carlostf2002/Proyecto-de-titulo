// Aplica el tema guardado antes del primer render para evitar el flash de
// tema incorrecto (FOUC) mientras React todavia no monta. Va como archivo
// externo (no inline) porque el backend manda un Content-Security-Policy
// (helmet) que bloquea "script-src 'self'" sin permitir scripts inline.
(function () {
  try {
    var guardado = localStorage.getItem("habitasmart_tema");
    var oscuro = guardado ? guardado === "oscuro" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (oscuro) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
