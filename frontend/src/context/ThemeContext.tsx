import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Tema = "claro" | "oscuro";

const STORAGE_KEY = "habitasmart_tema";

interface ThemeContextValue {
  tema: Tema;
  setTema: (tema: Tema) => void;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function temaInicial(): Tema {
  const guardado = localStorage.getItem(STORAGE_KEY);
  if (guardado === "claro" || guardado === "oscuro") return guardado;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  function setTema(nuevo: Tema) {
    setTemaState(nuevo);
  }

  function toggleTema() {
    setTemaState((prev) => (prev === "claro" ? "oscuro" : "claro"));
  }

  return <ThemeContext.Provider value={{ tema, setTema, toggleTema }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
