import axios from "axios";

const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";

// Login and store data to localStorage
export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  console.log("Logging in with:", userData);

  const response = await axios.post(`${baseUrl}/user/login`, userData);
  const data = response.data;
  console.log("Login response:", data);

  // Save returned fields in localStorage
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("username", data.username);
  localStorage.setItem("imageUrl", data.imageUrl); // Ensure backend returns imageUrl
  localStorage.setItem("email", data.email);
  localStorage.setItem("grade", data.grade);
  localStorage.setItem("rank", data.rank);
  localStorage.setItem("userId", data._id);
  localStorage.setItem("DateOfBirth", data.DateOfBirth);
  localStorage.setItem("parent_email", data.parent_email);
  localStorage.setItem("parent_name", data.parent_name);
  localStorage.setItem("parent_phone", data.parent_phone);


  return data;
};

// End of registration: update additional user details
export const endOfRegistration = async (userData: {
  userId?: string;
  imageUrl?: string;
  grade?: string;
  rank?: string;
  DateOfBirth?: string;
  parent_email?: string;
  parent_name?: string;
  parent_phone?: string;
  // ... any additional fields
}) => {
  console.log("baseUrl: " + baseUrl);
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

  // Update localStorage with new data
  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined) {
      localStorage.setItem(key, String(value));
    }
  });

  console.log("Updated data:", response.data);
  localStorage.setItem("imageUrl", response.data.imageUrl);
  localStorage.setItem("grade", response.data.grade);
  localStorage.setItem("rank", response.data.rank);
  localStorage.setItem("DateOfBirth", response.data.DateOfBirth);
  localStorage.setItem("parent_email", response.data.parent_email);
  localStorage.setItem("parent_name", response.data.parent_name);
  localStorage.setItem("parent_phone", response.data.parent_phone);
  localStorage.setItem("username", response.data.username);
  
  
  return response.data;
};

// Registration function
export const register = async (userData: {
  email: string;
  password: string;
  username: string;
}) => {
  const response = await axios.post(`${baseUrl}/user/register`, userData);
  console.log("Registration response:", response.data);
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("email", response.data.email);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("userId", response.data._id);
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

export default {
  loginUser,
  endOfRegistration,
  register,
  deleteUser,
  logout,
};
