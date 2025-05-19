import React, { createContext, useContext, useState, ReactNode } from "react";

interface ActionButtonsContextType {
  scanning: boolean;
  isKeyboard: boolean;
  expression: string;
  recognizedText: string;
  setScanning: (val: boolean) => void;
  setIsKeyboard: (val: boolean) => void;
  setExpression: (val: string) => void;
  setRecognizedText: (val: string) => void;
  clear: () => void;
  scanRequested: number;
  triggerScan: () => void;
}

const ActionButtonsContext = createContext<
  ActionButtonsContextType | undefined
>(undefined);

export const useActionButtons = () => {
  const context = useContext(ActionButtonsContext);
  if (!context) {
    throw new Error(
      "useActionButtons must be used within ActionButtonsProvider"
    );
  }
  return context;
};

export const ActionButtonsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scanning, setScanning] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(false);
  const [expression, setExpression] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [scanRequested, setScanRequested] = useState(0);

  const clear = () => {
    setExpression("");
    setRecognizedText("");
  };
  const triggerScan = () => {
    setScanRequested((prev) => prev + 1);
  };

  return (
    <ActionButtonsContext.Provider
      value={{
        scanning,
        isKeyboard,
        expression,
        recognizedText,
        setScanning,
        setIsKeyboard,
        setExpression,
        setRecognizedText,
        clear,
        scanRequested,
        triggerScan,
      }}
    >
      {children}
    </ActionButtonsContext.Provider>
  );
};
