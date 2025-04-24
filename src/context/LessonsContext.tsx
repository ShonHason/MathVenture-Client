import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// 1. Export the Topic shape (including optional _id for resumed lessons)
export interface Topic {
  _id?: string;
  subject: string;
  grade: string;
  rank: number;
  // you can add questions here if you like:
  questions?: any[];
}

// 2. Define what the hook will provide
interface LessonsContextType {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
}

// 3. Create the context
const LessonsContext = createContext<LessonsContextType | undefined>(
  undefined
);

// 4. Provider component
export const LessonsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  return (
    <LessonsContext.Provider value={{ topics, setTopics }}>
      {children}
    </LessonsContext.Provider>
  );
};

// 5. Custom hook for consuming
export function useLessons(): LessonsContextType {
  const ctx = useContext(LessonsContext);
  if (!ctx) {
    throw new Error("`useLessons` must be used within a `LessonsProvider`");
  }
  return ctx;
}
