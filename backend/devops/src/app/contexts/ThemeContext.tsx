import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "high-contrast";
type TextSize = "small" | "medium" | "large" | "extra-large";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("deepskyn-theme");
    return (saved as Theme) || "light";
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem("deepskyn-text-size");
    return (saved as TextSize) || "medium";
  });

  useEffect(() => {
    localStorage.setItem("deepskyn-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove("light", "dark", "high-contrast");
    // Add current theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("deepskyn-text-size", textSize);
    document.documentElement.setAttribute("data-text-size", textSize);
    
    // Remove all text size classes first
    document.documentElement.classList.remove("text-small", "text-medium", "text-large", "text-extra-large");
    // Add current text size class
    document.documentElement.classList.add(`text-${textSize}`);
  }, [textSize]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "high-contrast";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, textSize, setTextSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
