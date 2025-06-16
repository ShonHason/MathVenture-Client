import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd"; // Added Spin for loading indicator
import MathScreensaver from "../components/math-screensaver";
import user_api from "../services/user_api";
import { useUser } from "../context/UserContext";
import { googleSignIn } from "../services/user_api";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: { 
            client_id: string; 
            callback: (response: any) => void;
            context?: string;
            auto_select?: boolean;
            itp_support?: boolean;
            error_callback?: (error: any) => void;
          }) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
        };
      };
    }
  }
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { setUser } = useUser();

  // Add loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");

  // Handle direct navigation to registration tab
  useEffect(() => {
    // Check if there's a hash in the URL that indicates we should show registration
    if (window.location.hash === "#register") {
      setActiveTab("register");
    }
  }, []);

  useEffect(() => {
    // Log the current origin to help with troubleshooting the Google OAuth configuration
    console.log("Current origin:", window.location.origin);

    const loadGoogle = () => {
      // Get client ID from environment variables - only use the client ID here, not the secret
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;
      console.log("Google Client ID:", clientId);
      
      // Check if client ID exists and is properly formatted
      if (!clientId || clientId === "undefined" || clientId === "null") {
        console.error("Google Client ID is missing or invalid:", clientId);
        
        // Create a server-side OAuth button instead since client-side isn't configured
        const googleButtonContainer = document.getElementById("google-signin-button");
        if (googleButtonContainer) {
          googleButtonContainer.innerHTML = `
            <a 
              href="${process.env.REACT_APP_API_URL || ''}/auth/google"
              class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              התחבר עם Google
            </a>
          `;
        }
        
        message.error("Google Sign-In is not available due to configuration issues");
        return;
      }
      
      try {
        // Create a fallback button if Google Sign-In fails to load
        const googleButtonContainer = document.getElementById("google-signin-button");
        if (googleButtonContainer) {
          googleButtonContainer.innerHTML = '';
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          context: 'signin',
          auto_select: false,
          // Log any errors during initialization
          error_callback: (error: any) => {
            console.error("Google Sign-In initialization error:", error);
          }
        });
        
        // Log successful initialization
        console.log("Google Sign-In initialized with client ID:", clientId);
        
        window.google.accounts.id.renderButton(
          googleButtonContainer,
          {
            theme: "outline",
            size: "large", 
            text: "signin_with",  // Changed from continue_with to signin_with
            width: "250",  // Remove "px" suffix
            locale: 'en',
            logo_alignment: "center"
          }
        );
        
        console.log("Google Sign-In button rendered");
      } catch (error) {
        console.error("Error during Google Sign-In setup:", error);
        
        // Replace the Google button with a custom one that will work regardless of Google API errors
        const googleButtonContainer = document.getElementById("google-signin-button");
        if (googleButtonContainer) {
          // Create a custom button that directly redirects to your backend OAuth endpoint
          googleButtonContainer.innerHTML = `
            <a 
              href="${process.env.REACT_APP_API_URL || ''}/auth/google"
              class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              התחבר עם Google
            </a>
          `;
        }
      }
    };

    // Add a small delay before loading Google to ensure DOM is ready
    setTimeout(() => {
      if (window.google && window.google.accounts) {
        loadGoogle();
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = loadGoogle;
        script.onerror = (error) => {
          console.error("Failed to load Google Sign-In script:", error);
          
          // Replace the Google button with a custom one that will work regardless of Google API errors
          const googleButtonContainer = document.getElementById("google-signin-button");
          if (googleButtonContainer) {
            googleButtonContainer.innerHTML = `
              <a 
                href="${process.env.REACT_APP_API_URL || ''}/auth/google"
                class="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                התחבר עם Google
              </a>
            `;
          }
        };
        document.head.appendChild(script);
      }
    }, 100);
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      setIsGoogleLoading(true); // Set loading state when Google login starts
      
      // Decode the JWT token to get user info including picture
      const decoded = JSON.parse(atob(response.credential.split(".")[1]));
      console.log("Google user info:", decoded);
      
      // Call Google sign-in API
      const result = await googleSignIn(response.credential);
      console.log("API response:", result);
      
      // Store picture URL from Google data
      const pictureUrl = decoded?.picture || "";
      
      // Create enhanced user object with all necessary fields
      const enhancedUserData = {
        ...result,
        subjectsList: result.subjectsList || [],
        fullname: result.username || decoded.name || "",
        imageUrl: pictureUrl,
        grade: result.grade || "",
        // Make sure any other important fields are included
      };
      console.log("Enhanced user data:", enhancedUserData);
      // Store tokens in localStorage (NOT sessionStorage)
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      localStorage.setItem("userId", result._id);
      localStorage.setItem("imageUrl", pictureUrl); // Store image URL separately
      
      // Store complete user data in localStorage (NOT sessionStorage)
      localStorage.setItem("user", JSON.stringify(enhancedUserData));
      
      // Update user context with the enhanced data
      setUser(enhancedUserData);
  
      message.success("Google login successful!");
      navigate(result.isNewUser ? "/quiz" : "/home");
    } catch (err) {
      console.error("Google login failed:", err);
      message.error("Google Sign-In failed");
    } finally {
      setIsGoogleLoading(false); // Clear loading state regardless of outcome
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true); // Set loading state when login starts
    try {
      console.log("Login Attempt:", { email, password });
      const data = await user_api.loginUser({
        email,
        password,
      });
      
      // Create enhanced user object with consistent structure
      const enhancedUserData = {
        ...data,
        subjectsList: data.subjectsList || [],
        fullname: data.username || "",
        imageUrl: data.imageUrl || "",
        grade: data.grade || "",
      };
      
      // Use localStorage instead of sessionStorage for consistency with Google login
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", data._id);
      
      if (data.imageUrl) {
        localStorage.setItem("imageUrl", data.imageUrl);
      }
      
      // Store complete user data in localStorage
      localStorage.setItem("user", JSON.stringify(enhancedUserData));
      
      // Update user context
      setUser(enhancedUserData);
      
      message.success("Login successful!");
      console.log("User data:", enhancedUserData);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Login failed");
    } finally {
      setIsLoginLoading(false); // Clear loading state regardless of outcome
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      message.error("Passwords don't match!");
      return;
    }

    setIsRegisterLoading(true); // Set loading state when registration starts
    try {
      const registrationData = {
        username,
        email,
        password,
        gender,
      };
      console.log("Registration Attempt:", registrationData);
      const newuser = await user_api.register(registrationData);
      setUser((prev) => ({
        ...prev!,
        ...newuser,
      }));
      message.success("Registration successful");
      navigate("/quiz");
    } catch (error) {
      console.error("Registration failed:", error);
      message.error("Registration failed");
    } finally {
      setIsRegisterLoading(false); // Clear loading state regardless of outcome
    }
  };

  return (
    <main className="min-h-screen bg-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Math screensaver background */}
      <MathScreensaver />

      {/* Show a full-page loader when any loading state is active */}
      {(isLoginLoading || isRegisterLoading || isGoogleLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-700 font-heebo">
              {isLoginLoading ? "מתחבר..." : 
               isRegisterLoading ? "יוצר חשבון..." : 
               "מתחבר עם גוגל..."}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden z-10 relative">
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="relative w-28 h-28">
              <img
                src="/logo.png"
                alt="MathVenture Mascot"
                className="object-contain w-full h-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-center text-purple-700">
              MATHVENTURE
            </h1>
            <p className="text-sm font-medium text-center text-purple-600">
              EXPLORE MATH
            </p>
          </div>

          <div className="text-center space-y-1 rtl">
            <h2 className="text-lg font-bold text-gray-800 font-heebo">
              ברוכים הבאים למאטוונצ׳ר!
            </h2>
            <p className="text-sm text-gray-600 font-heebo">
              בחרו אחת מן האופציות הבאות:
            </p>
          </div>

          <div className="w-full">
            <div className="grid w-full grid-cols-2">
              <button
                className={`text-sm font-heebo py-2 ${
                  activeTab === "login"
                    ? "bg-white border-b-2 border-purple-600 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setActiveTab("login")}
              >
                התחברות
              </button>
              <button
                className={`text-sm font-heebo py-2 ${
                  activeTab === "register"
                    ? "bg-white border-b-2 border-purple-600 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setActiveTab("register")}
              >
                הרשמה
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3 mt-3">
                <div className="space-y-1 rtl">
                  <label htmlFor="email" className="block text-sm font-heebo">
                    אימייל
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="הכנס אימייל"
                    className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 rtl">
                  <label
                    htmlFor="password"
                    className="block text-sm font-heebo"
                  >
                    סיסמא
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="הכנס סיסמא"
                      className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md font-heebo flex items-center justify-center"
                  disabled={isLoginLoading} // Disable button when loading
                >
                  {isLoginLoading ? <Spin size="small" className="mr-2" /> : null}
                  התחבר
                </button>

                <p className="text-center text-xs text-gray-500 font-heebo">
                  אין לך חשבון?{" "}
                  <button
                    type="button"
                    className="text-purple-600 hover:underline font-medium"
                    onClick={() => setActiveTab("register")}
                  >
                    הירשם עכשיו
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 mt-3">
                <div className="space-y-1 rtl">
                  <label
                    htmlFor="username"
                    className="block text-sm font-heebo"
                  >
                    שם התלמיד
                  </label>
                  <input
                    id="username"
                    placeholder="שם התלמיד"
                    className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 rtl">
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-heebo"
                  >
                    אימייל
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="אנא הכנס את האימייל שלך!"
                    className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 rtl">
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-heebo"
                  >
                    סיסמא
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="צור סיסמא"
                      className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 rtl">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-heebo"
                  >
                    אשר סיסמה
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="אשר את הסיסמא שלך"
                      className="h-10 text-sm w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 rtl">
                  <label className="block text-sm font-heebo">מין</label>
                  <div className="flex flex-row-reverse justify-end space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse mr-2">
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="female"
                        className="h-4 w-4 text-purple-600"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                      />
                      <label htmlFor="female" className="font-heebo">
                        נקבה
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="male"
                        className="h-4 w-4 text-purple-600"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                      />
                      <label htmlFor="male" className="font-heebo">
                        זכר
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md font-heebo flex items-center justify-center"
                  disabled={isRegisterLoading} // Disable button when loading
                >
                  {isRegisterLoading ? <Spin size="small" className="mr-2" /> : null}
                  הירשם
                </button>

                <p className="text-center text-xs text-gray-500 font-heebo">
                  כבר יש לך חשבון?{" "}
                  <button
                    type="button"
                    className="text-purple-600 hover:underline font-medium"
                    onClick={() => setActiveTab("login")}
                  >
                    התחבר
                  </button>
                </p>
              </form>
            )}
          </div>

          <div className="pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-heebo">
                  או
                </span>
              </div>
            </div>

            <div className="mt-3">
              <div id="google-signin-button" className="w-full flex justify-center">
                {/* Google Sign-In button will be rendered here by the Google API */}
                {isGoogleLoading && <Spin size="small" className="mt-2" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
