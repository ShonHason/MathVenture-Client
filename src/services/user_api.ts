import axios from "axios";

const baseUrl = process.env.SERVER_API_URL;

// התחברות ושמירת מידע מהשרת ל-localStorage
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  console.log("Logging in with:", userData);

  const response = await axios.post(
    `${process.env.API_URL}/auth/login`,
    userData
  );

  const data = response.data;
  console.log("Login response:", data);

  // שמירת הנתונים שהתקבלו ב-localStorage
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("username", data.username);
  localStorage.setItem("imageUrl", data.imagePath);
  localStorage.setItem("email", data.email);
  localStorage.setItem("grade", data.grade);
  localStorage.setItem("rank", data.rank);
  localStorage.setItem("userId", data.id);

  return data;
}

export const updateUser = async (userData: {
  email: string;
  password: string;
  username: string;
  imageUrl: string;
  grade: string;
  rank: string;
}) => {
  // שליפת ערכים קיימים מה-localStorage
  const oldData = {
    email: localStorage.getItem("email") || "",
    username: localStorage.getItem("username") || "",
    imageUrl: localStorage.getItem("imageUrl") || "",
    grade: localStorage.getItem("grade") || "",
    rank: localStorage.getItem("rank") || "",
  };

  // בדיקה אילו שדות השתנו
  const changedFields: Record<string, string> = {};
  Object.entries(userData).forEach(([key, newValue]) => {
    const oldValue = oldData[key as keyof typeof oldData];
    if (newValue && newValue !== oldValue) {
      changedFields[key] = String(newValue);
    }
  })

  // תמיד נשלח סיסמה אם קיימת
  if (userData.password) {
    changedFields.password = userData.password;
  }

  if (Object.keys(changedFields).length === 0) {
    console.log("No changes detected.");
    return { message: "No changes" };
  }

  const response = await axios.put(
    `${process.env.API_URL}/auth/update`,
    changedFields,
    {
      headers: {
        Authorization: "jwt " + localStorage.getItem("accessToken"),
      },
    }
  );

  // עדכון ה-localStorage עם הערכים החדשים
  Object.entries(changedFields).forEach(([key, value]) => {
    localStorage.setItem(key, String(value));
  });

  console.log("Updated data:", response.data);
  return response.data;
};
const register = async (userDate: {
  username: string;
  email: string;
  password: string;
  parent_email: string;
  parent_phone: string;
  grade: string;
  rank: string;
}) => {
  const respone = await axios.post(`${baseUrl}/register`);
  localStorage.setItem("userId", respone.data.userId);
  localStorage.setItem("username", respone.data.username);
  localStorage.setItem("rank", respone.data.rank);
  localStorage.setItem("grade", respone.data.grade);
  localStorage.setItem("email", respone.data.email);
  localStorage.setItem("parent_email", respone.data.parent_email);
  localStorage.setItem("refreshToken", respone.data.refreshToken);
  localStorage.setItem("accessToken", respone.data.accessToken);
};

const checkTokenExp = async () => {
  console.log("Checking Refresh token...");

  const token = localStorage.getItem("accessToken");
  if (!token) return;

  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = exp - now;

    console.log(`Token expires in ${timeLeft} seconds`);

    if (timeLeft <= 120) {
      console.log("Refreshing token...");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return;
      }

      const newToken = await axios.post(`${baseUrl}/auth/refresh/`, {
        refreshToken,
      });
      if (!newToken) {
        console.warn("Token refresh failed, redirecting to login");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("imgUrl");
        localStorage.clear();
        window.location.href = "/login";
      }
      localStorage.setItem("accessToken", newToken.data.accessToken);
      localStorage.setItem("refreshToken", newToken.data.refreshToken);
      console.log("Token refreshed successfully");
    }
  } catch (error) {
    console.error("Error checking token expiration", error);
  }
};
setInterval(checkTokenExp, 100000);

const deleteUser = async () => {
const accessToken = localStorage.getItem("accessToken");
const userId = localStorage.getItem("userId");

const response = await axios.delete(`${baseUrl}/deleteUser`, {
    params: { userId: userId },
    headers: {
      Authorization: "jwt " + accessToken,
    },
  });
};

const logout = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  try {
    const response = await axios.post(
      `${baseUrl}/logout`,
      { userId: userId },
      {
        headers: {
          Authorization: "jwt " + accessToken,
        },
      }
    );

    localStorage.clear();
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    localStorage.clear();
    throw error;
  }
    
}



