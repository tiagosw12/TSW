import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemeChoice = "system" | "dark" | "light";
const STORAGE_KEY = "study-app-theme";

interface ThemeContextValue {
  choice: ThemeChoice;
  setChoice: (choice: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ThemeChoice>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeChoice) || "system",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, choice);
    const root = document.documentElement;
    if (choice === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", choice);
    }
  }, [choice]);

  return <ThemeContext.Provider value={{ choice, setChoice }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
