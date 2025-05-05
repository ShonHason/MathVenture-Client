import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  type Theme = "light" | "dark";
  
  interface DisplaySettings {
    fontSize: number;
    theme: Theme;
    highContrast: boolean;
    primaryColor: string;
    setFontSize: (n: number) => void;
    setTheme: (t: Theme) => void;
    setHighContrast: (c: boolean) => void;
    setPrimaryColor: (c: string) => void;
  }
  
  const DisplaySettingsContext = createContext<DisplaySettings | null>(null);
  
  export const DisplaySettingsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    // טענת ערכים מתוך localStorage או ברירות מחדל
    const [fontSize, setFontSize] = useState<number>(
      () => parseInt(localStorage.getItem("ds.fontSize") || "16", 10)
    );
    const [theme, setTheme] = useState<Theme>(
      (localStorage.getItem("ds.theme") as Theme) || "light"
    );
    const [highContrast, setHighContrast] = useState<boolean>(
      () => localStorage.getItem("ds.highContrast") === "true"
    );
    const [primaryColor, setPrimaryColor] = useState<string>(
      localStorage.getItem("ds.primaryColor") || "#6A4CFF"
    );
  
    // בכל שינוי – עדכן localStorage + CSS vars / class ב־<body>
    useEffect(() => {
      localStorage.setItem("ds.fontSize", fontSize.toString());
      document.documentElement.style.setProperty(
        "--global-font-size",
        `${fontSize}px`
      );
    }, [fontSize]);
  
    useEffect(() => {
      localStorage.setItem("ds.theme", theme);
      document.body.classList.toggle("theme-dark", theme === "dark");
    }, [theme]);
  
    useEffect(() => {
      localStorage.setItem("ds.highContrast", highContrast.toString());
      document.documentElement.classList.toggle("high-contrast", highContrast);
    }, [highContrast]);
  
    useEffect(() => {
      localStorage.setItem("ds.primaryColor", primaryColor);
      document.documentElement.style.setProperty(
        "--primary-color",
        primaryColor
      );
    }, [primaryColor]);
  
    return (
      <DisplaySettingsContext.Provider
        value={{
          fontSize,
          theme,
          highContrast,
          primaryColor,
          setFontSize,
          setTheme,
          setHighContrast,
          setPrimaryColor,
        }}
      >
        {children}
      </DisplaySettingsContext.Provider>
    );
  };
  
  // hook נוח לכל קצה
  export const useDisplaySettings = () => {
    const ctx = useContext(DisplaySettingsContext);
    if (!ctx) throw new Error("Must be inside DisplaySettingsProvider");
    return ctx;
  };
  