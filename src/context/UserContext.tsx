// src/context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

export interface User {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  grade?: string;
  gender?: string;
  rank?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  opportunities?: string;
  twoFactorAuth?: boolean;
  parent_email?: string;
  parent_name?: string;
  parent_phone?: string;

  // **these three are missing**:
  accessToken: string; // or mark optional if it really can be undefined
  refreshToken: string;
}
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 1️⃣ על mount – טען מה־sessionStorage או מהשרת
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (stored && accessToken && refreshToken) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser({ ...parsed, accessToken, refreshToken });
      } catch {
        sessionStorage.clear();
        setUser(null);
      }
    } else if (accessToken) {
      // fallback: קבלת פרופיל מהשרת
      axios
        .get("https://localhost:4000/user/getUserProfile", {
          headers: { Authorization: `JWT ${accessToken}` },
        })
        .then((res) => {
          const fetched: User = {
            ...res.data,
            accessToken,
            refreshToken: refreshToken || "",
            subjectsList: res.data.subjectsList || [],
          };
          setUser(fetched);
          sessionStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch(() => setUser(null));
    }
  }, []);

  // 2️⃣ בסיום כל שינוי ב־user – עדכן גם את ה־sessionStorage
  useEffect(() => {
    if (user) {
      // שמור את כל השדות חוץ מהטוקנים (טוקנים נשמרים בנפרד)
      const { accessToken, refreshToken, ...rest } = user;
      sessionStorage.setItem("user", JSON.stringify(rest));
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    } else {
      // אם user == null, ננקה את כל ה־storage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
      
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};