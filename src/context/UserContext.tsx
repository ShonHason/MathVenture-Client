import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// הגדרת טיפוסי המשתמש
export interface User {
  _id: string;
  username: string;
  email: string;
  parent_email?: string;
  parent_name?: string;
  parent_phone?: string;
  grade?: string;
  gender?: string;
  rank?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  opportunities?: string;
  twoFactorAuth?: boolean;
  accessToken: string;
  refreshToken: string;
}

// טיפוס של הקונטקסט
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// יצירת הקונטקסט
const UserContext = createContext<UserContextType | undefined>(undefined);

// קומפוננטת הספק
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (storedUser && accessToken && refreshToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          ...parsed,
          accessToken,
          refreshToken,
        });
      } catch (err) {
        console.error("Failed to parse user from sessionStorage", err);
        sessionStorage.removeItem("user");
        setUser(null);
      }
    } else if (accessToken) {
      // fallback - בקשה לשרת במידה ואין sessionStorage תקין
      axios
        .post("http://localhost:4000/user/getUserProfile", {
          accessToken,
        })
        .then((res) => {
          const fetchedUser: User = {
            ...res.data,
            accessToken,
            refreshToken: refreshToken || "",
          };
          setUser(fetchedUser);
          sessionStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error("Failed to fetch user profile", err);
          setUser(null);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// hook לשימוש נוח בקונטקסט
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
