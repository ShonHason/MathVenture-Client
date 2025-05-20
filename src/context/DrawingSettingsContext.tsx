import React, { createContext, useContext, useState } from "react";

interface DrawingSettingsContextType {
  penWidth: number;
  setPenWidth: (val: number) => void;
  gridCount: number;
  setGridCount: (val: number) => void;
}

const DrawingSettingsContext = createContext<
  DrawingSettingsContextType | undefined
>(undefined);

export const DrawingSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [penWidth, setPenWidth] = useState(6);
  const [gridCount, setGridCount] = useState(20);

  return (
    <DrawingSettingsContext.Provider
      value={{ penWidth, setPenWidth, gridCount, setGridCount }}
    >
      {children}
    </DrawingSettingsContext.Provider>
  );
};

export const useDrawingSettings = () => {
  const context = useContext(DrawingSettingsContext);
  if (!context) {
    throw new Error(
      "useDrawingSettings must be used within a DrawingSettingsProvider"
    );
  }
  return context;
};
