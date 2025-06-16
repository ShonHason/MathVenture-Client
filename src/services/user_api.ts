import axios from "axios";

const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
export const updateUserProfile = async (userData: {
  userId: string;
  username?: string;
  gender?: string;
  email?: string;
  parent_phone?: string;
  grade?: string;
  imageUrl?: string;
  parent_name?: string;
  parent_email?: string;
}) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.put(`${baseUrl}/user/updateProfile`, userData, {
    headers: {
      Authorization: "jwt " + accessToken,
    },
  });

  return response.data;
};

type User = {
  _id: string;
  username: string;
  email: string;
  parent_email?: string;
  gender?: string;
  parent_name?: string;
  parent_phone?: string;
  grade?: string;
  rank?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  accessToken: string;
  refreshToken: string;
  opportunities?: string;
  twoFactorAuth?: boolean;
  subjectsList?: string[]; // Added subjectsList property
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}): Promise<User> => {
  const response = await axios.post(`${baseUrl}/user/login`, userData);
  const data = response.data;
  console.log("Login response:", data);
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("userId", data._id);
  return {
    _id: data._id,
    username: data.username,
    email: data.email,
    gender: data.gender,
    parent_email: data.parent_email,
    parent_name: data.parent_name,
    parent_phone: data.parent_phone,
    grade: data.grade,
    rank: data.rank,
    dateOfBirth: data.DateOfBirth, // הקפד על תיאום שם
    imageUrl: data.imageUrl,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    opportunities: data.opportunities ?? "לא ידוע", // אם קיים
    twoFactorAuth: data.twoFactorAuth ?? false, // אם קיים
    subjectsList: data.subjectsList ?? [], // אם קיים
  };
};

export const endOfRegistration = async (userData: {
  userId?: string;
  imageUrl?: string;
  grade?: string;
  gender?: string;
  rank?: string;
  DateOfBirth?: string;
  parent_email?: string;
  parent_name?: string;
  parent_phone?: string;
}) => {
  console.log("Sending user data:", userData);

  const response = await axios.put(
    `${baseUrl}/user/endOfRegistration`,
    userData,
    {
      headers: {
        Authorization: "jwt " + localStorage.getItem("accessToken"),
      },
    }
  );

  return {
    _id: response.data._id,
    username: response.data.username,
    email: response.data.email,
    gender: response.data.gender,
    parent_email: response.data.parent_email,
    parent_name: response.data.parent_name,
    parent_phone: response.data.parent_phone,
    grade: response.data.grade,
    rank: response.data.rank,
    dateOfBirth: response.data.DateOfBirth,
    imageUrl: response.data.imageUrl,
    subjectList : response.data.subjectsList,
  };
};

// Registration function
export const register = async (userData: {
  email: string;
  password: string;
  username: string;
}) => {
  const response = await axios.post(`${baseUrl}/auth/register`, userData);
  console.log("Registration response:", response.data);
  return {
    _id: response.data._id,
    username: response.data.username,
    email: response.data.email,
    parent_email: response.data.parent_email,
    parent_name: response.data.parent_name,
    parent_phone: response.data.parent_phone,
    grade: response.data.grade,
    gender: response.data.gender,
    rank: response.data.rank,
    dateOfBirth: response.data.DateOfBirth,
    imageUrl: response.data.imageUrl,
  };
};

// Check token expiration and refresh if needed
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

      const newToken = await axios.post(`${baseUrl}/user/refresh`, {
        refreshToken,
      });
      if (!newToken) {
        console.warn("Token refresh failed, redirecting to login");
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

checkTokenExp(); 
setInterval(checkTokenExp, 100000);


// Delete user
export const deleteUser = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  const response = await axios.delete(`${baseUrl}/user/deleteUser`, {
    params: { userId },
    headers: {
      Authorization: "jwt " + accessToken,
    },
  });
};

// Logout user
export const logout = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  try {
    const response = await axios.post(
      `${baseUrl}/user/logout`,
      { userId },
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
};
export const addSubject = async (userId: string, subject: string) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await axios.put(
    `${baseUrl}/user/addSubject`,
    { userId, subject },
    {
      headers: {
        Authorization: "jwt " + accessToken,
      },
    }
  );
  return response.data;
};

export const removeSubject = async (userId: string, subject: string) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await axios.put(
    `${baseUrl}/user/removeSubject`,
    { userId, subject },
    {
      headers: {
        Authorization: "jwt " + accessToken,
      },
    }
  );
  return response.data;
};


export const googleSignIn = async (credential: string) => {
  const response = await axios.post(`${baseUrl}/auth/google-signin`, {
    token: credential,
  });

  return response.data;
};

export default {
  
  loginUser,
  endOfRegistration,
  register,
  deleteUser,
  logout,
};
