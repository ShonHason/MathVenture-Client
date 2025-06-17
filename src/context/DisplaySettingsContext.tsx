import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface DisplaySettings {
  fontSize: number;
  lineHeight: number;
  formulaFontSize: number;
  highContrast: boolean;
  primaryColor: string;
  theme: Theme;
  setFontSize: (n: number) => void;
  setLineHeight: (n: number) => void;
  setFormulaFontSize: (n: number) => void;
  setHighContrast: (c: boolean) => void;
  setPrimaryColor: (c: string) => void;
  setTheme: (theme: Theme) => void;
}

const DisplaySettingsContext = createContext<DisplaySettings | null>(null);

export const DisplaySettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontSize, setFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem("ds.fontSize") || "16", 10)
  );
  const [lineHeight, setLineHeight] = useState<number>(() =>
    parseFloat(localStorage.getItem("ds.lineHeight") || "1.5")
  );
  const [formulaFontSize, setFormulaFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem("ds.formulaFontSize") || "24", 10)
  );
  const [highContrast, setHighContrast] = useState<boolean>(
    () => localStorage.getItem("ds.highContrast") === "true"
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    () => localStorage.getItem("ds.primaryColor") || "#6A4CFF"
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("ds.theme") as Theme) || "light"
  );

  // Sync font size
  useEffect(() => {
    localStorage.setItem("ds.fontSize", fontSize.toString());
    document.documentElement.style.setProperty(
      "--global-font-size",
      `${fontSize}px`
    );
  }, [fontSize]);

  // Sync line height
  useEffect(() => {
    localStorage.setItem("ds.lineHeight", lineHeight.toString());
    document.documentElement.style.setProperty(
      "--global-line-height",
      lineHeight.toString()
    );
  }, [lineHeight]);

  // Sync formula font size
  useEffect(() => {
    localStorage.setItem("ds.formulaFontSize", formulaFontSize.toString());
    document.documentElement.style.setProperty(
      "--formula-font-size",
      `${formulaFontSize}px`
    );
  }, [formulaFontSize]);

  // Sync high contrast
  useEffect(() => {
    localStorage.setItem("ds.highContrast", highContrast.toString());
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Sync primary color
  useEffect(() => {
    localStorage.setItem("ds.primaryColor", primaryColor);
    document.documentElement.style.setProperty("--primary-color", primaryColor);
  }, [primaryColor]);

  // Sync theme (dark/light)
  useEffect(() => {
    localStorage.setItem("ds.theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <DisplaySettingsContext.Provider
      value={{
        fontSize,
        lineHeight,
        formulaFontSize,
        highContrast,
        primaryColor,
        theme,
        setFontSize,
        setLineHeight,
        setFormulaFontSize,
        setHighContrast,
        setPrimaryColor,
        setTheme,
      }}
    >
      {children}
    </DisplaySettingsContext.Provider>
  );
};

export const useDisplaySettings = () => {
  const ctx = useContext(DisplaySettingsContext);
  if (!ctx) throw new Error("Must be inside DisplaySettingsProvider");
  return ctx;
};

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// type Theme = "light" | "dark";

// interface DisplaySettings {
//   fontSize: number;
//   lineHeight: number;
//   formulaFontSize: number;
//   highContrast: boolean;
//   primaryColor: string;
//   setFontSize: (n: number) => void;
//   setLineHeight: (n: number) => void;
//   setFormulaFontSize: (n: number) => void;
//   setHighContrast: (c: boolean) => void;
//   setPrimaryColor: (c: string) => void;
// }

// const DisplaySettingsContext = createContext<DisplaySettings | null>(null);

// export const DisplaySettingsProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [fontSize, setFontSize] = useState<number>(
//     () => parseInt(localStorage.getItem("ds.fontSize") || "16", 10)
//   );
//   const [lineHeight, setLineHeight] = useState<number>(
//     () => parseFloat(localStorage.getItem("ds.lineHeight") || "1.5")
//   );
//   const [formulaFontSize, setFormulaFontSize] = useState<number>(
//     () => parseInt(localStorage.getItem("ds.formulaFontSize") || "24", 10)
//   );
//   const [highContrast, setHighContrast] = useState<boolean>(
//     () => localStorage.getItem("ds.highContrast") === "true"
//   );
//   const [primaryColor, setPrimaryColor] = useState<string>(
//     () => localStorage.getItem("ds.primaryColor") || "#6A4CFF"
//   );

//   // Sync font size
//   useEffect(() => {
//     localStorage.setItem("ds.fontSize", fontSize.toString());
//     document.documentElement.style.setProperty(
//       "--global-font-size",
//       `${fontSize}px`
//     );
//   }, [fontSize]);

//   // Sync line height
//   useEffect(() => {
//     localStorage.setItem("ds.lineHeight", lineHeight.toString());
//     document.documentElement.style.setProperty(
//       "--global-line-height",
//       lineHeight.toString()
//     );
//   }, [lineHeight]);

//   // Sync formula font size
//   useEffect(() => {
//     localStorage.setItem("ds.formulaFontSize", formulaFontSize.toString());
//     document.documentElement.style.setProperty(
//       "--formula-font-size",
//       `${formulaFontSize}px`
//     );
//   }, [formulaFontSize]);

//   // Sync high contrast
//   useEffect(() => {
//     localStorage.setItem("ds.highContrast", highContrast.toString());
//     document.documentElement.classList.toggle("high-contrast", highContrast);
//   }, [highContrast]);

//   // Sync primary color
//   useEffect(() => {
//     localStorage.setItem("ds.primaryColor", primaryColor);
//     document.documentElement.style.setProperty(
//       "--primary-color",
//       primaryColor
//     );
//   }, [primaryColor]);

//   return (
//     <DisplaySettingsContext.Provider
//       value={{
//         fontSize,
//         lineHeight,
//         formulaFontSize,
//         highContrast,
//         primaryColor,
//         setFontSize,
//         setLineHeight,
//         setFormulaFontSize,
//         setHighContrast,
//         setPrimaryColor,
//       }}
//     >
//       {children}
//     </DisplaySettingsContext.Provider>
//   );
// };

// export const useDisplaySettings = () => {
//   const ctx = useContext(DisplaySettingsContext);
//   if (!ctx) throw new Error("Must be inside DisplaySettingsProvider");
//   return ctx;
// };
