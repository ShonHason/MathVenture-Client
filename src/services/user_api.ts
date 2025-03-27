import axios from "axios";
import dotenv from "dotenv";
// const register;

// const updateUser;

// const login;

// const checkTokenExpiration;

// const getUser;

// const deleteUser;

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
  localStorage.setItem("id", data.id);

  return data;
};

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
  });

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
