
// "use client";

// import { useState } from "react";
// // Import the CSS file
// import "./DeleteAccount.css";

// const DeleteAccount = () => {
//   const [password, setPassword] = useState("");

//   const handleDelete = () => {
//     if (password) {
//       console.log("Deleting account...");
//       // Here, you would typically handle the deletion by calling an API
//       // e.g., show a confirmation modal, call delete API, then redirect or log out
//     } else {
//       alert("Please enter your password to confirm account deletion.");
// =======
// import { useState } from "react"
// import axios from "axios"
// import { useUser } from "../context/UserContext"
// import { toast } from "react-hot-toast"
// import { useNavigate } from "react-router-dom"
// const DeleteAccount = () => {
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState(false)
//   const { user, setUser } = useUser()
//   const navigate = useNavigate();
 
//   const handleDelete = async () => {
//     if (!password) {
//       toast.error("אנא הכנס את הסיסמה שלך לאישור מחיקת החשבון")
//       return
//     }
    
//     setIsLoading(true)
//     setError(null)
    
//     try {
//       const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
//       // Make the delete request to your backend with token authentication
//       console.log("Using base URL:", baseUrl)
//       const accessToken = user?.accessToken;
      
//       // Axios delete with properly formatted data
//       await axios.delete(`${baseUrl}/user/deleteUser`, {
//         headers: {
//           Authorization: `JWT ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         data: { 
//           userId: user?._id,
//           password: password
//         }
//       })
      
//       // On successful deletion
//       console.log("Account successfully deleted")
      
//       // Clear user data from context
//       setUser(null)
      
//       // Clear session storage
//       sessionStorage.removeItem("user")
//       sessionStorage.removeItem("accessToken")
//       sessionStorage.removeItem("refreshToken")
      
//       // Show success message with toast
//       toast.success("החשבון נמחק בהצלחה")
      
//       // Set success state
//       setSuccess(true)
//       navigate("/")
//     } catch (err: any) {
//       console.error("Error deleting account:", err)
//       const errorMessage = err.response?.data?.message || "אירעה שגיאה במחיקת החשבון. אנא נסה שוב."
//       setError(errorMessage)
//       toast.error(errorMessage)
//     } finally {
//       setIsLoading(false)
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//     }
//   };

// <<<<<<< HEAD
//   return (
//     <div className="delete-account-container">
//       <div className="delete-account-header">
//         <div className="warning-icon">⚠️</div>
//         <h1>מחיקת חשבון</h1>
//         <p>פעולה זו לא ניתנת לביטול!</p>
// =======
//   if (success) {
//     return (
//       <div className="max-w-2xl mx-auto p-4 bg-green-100 rounded-lg shadow-lg my-4 border-2 border-green-300 rtl text-center">
//         <h2 className="text-xl font-bold text-green-800 mb-2">✅ החשבון נמחק בהצלחה</h2>
//         <p className="text-gray-700">החשבון שלך נמחק בהצלחה מהמערכת.</p>
//         <a href="/" className="block mt-4 text-blue-600 hover:underline">חזרה לדף הבית</a>
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//       </div>
//     )
//   }

// <<<<<<< HEAD
//       <div className="space-y-3">
//         {/* Tailwind space-y is equivalent to margin-top on children. Need to adjust or apply to children */}
//         <div className="delete-account-input-section">
//           <label>🔒 הכנס סיסמה לאישור:</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="הכנס את הסיסמה שלך"
//           />
//         </div>
//         <div className="delete-account-warning-box">
//           <h3>⚠️ שים לב!</h3>
//           <p>
//             מחיקת הפרופיל תסיר את כל המידע האישי שלך באופן קבוע ולא יהיה ניתן
//             לשחזרו
//           </p>
//           <ul>
//             <li>
//               <span>🗑️</span>
//               כל הנתונים האישיים יימחקו
//             </li>
//             <li>
//               <span>📧</span>
//               היסטוריית המיילים תאבד
//             </li>
//             <li>
//               <span>🏆</span>
//               הישגים ורמות יאבדו
//             </li>
//             <li>
//               <span>📱</span>
//               לא יהיה ניתן לשחזר את החשבון
//             </li>
//           </ul>
//         </div>
//         <div className="delete-account-buttons">
//           <button onClick={handleDelete} className="delete-button">
//             <span className="icon">🗑️</span>
//             מחק חשבון לצמיתות
//           </button>

//           <button className="back-button">חזרה למסך הראשי</button>
// =======
//   return (
//     <div className="text-center">
//       <h2 className="text-red-600 text-xl mb-2">⚠️ מחיקת חשבון</h2>
//       <p className="text-red-800 text-sm mb-4">
//         האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו לא ניתנת לביטול ותאבד את כל הנתונים שלך.
//       </p>
      
//       <div className="max-w-2xl mx-auto p-4 bg-purple-300 rounded-lg shadow-lg my-4 border-2 border-purple-400 rtl">
//         <div className="text-center mb-3 bg-yellow-50 p-3 rounded-lg">
//           <div className="text-3xl mb-1">⚠️</div>
//           <h1 className="text-xl font-bold text-gray-800">מחיקת חשבון</h1>
//           <p className="text-red-500 font-semibold text-sm">פעולה זו לא ניתנת לביטול!</p>
//         </div>

//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-3 border border-red-300">
//             <p className="text-center font-semibold">{error}</p>
//           </div>
//         )}

//         <div className="space-y-3">
//           <div className="mb-2">
//             <label className="block text-base font-medium text-gray-700 mb-1">🔒 הכנס סיסמה לאישור:</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="הכנס את הסיסמה שלך"
//               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               disabled={isLoading}
//             />
//             <div className="mt-1 p-2 bg-blue-50 text-sm text-blue-700 rounded-md border border-blue-200">
//               <span className="font-bold">💡 טיפ:</span> משתמשי Google צריכים להקליד "GoogleUser" כסיסמה למחיקת החשבון
//             </div>
//           </div>

//           <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
//             <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center">
//               ⚠️ שים לב!
//             </h3>
//             <p className="text-gray-700 mb-2 text-sm">
//               מחיקת הפרופיל תסיר את כל המידע האישי שלך באופן קבוע ולא יהיה ניתן לשחזרו
//             </p>
//             <ul className="space-y-1 text-gray-700 text-sm">
//               <li className="flex items-center">
//                 <span className="ml-2">🗑️</span>
//                 כל הנתונים האישיים יימחקו
//               </li>
//               <li className="flex items-center">
//                 <span className="ml-2">📧</span>
//                 היסטוריית המיילים תאבד
//               </li>
//               <li className="flex items-center">
//                 <span className="ml-2">🏆</span>
//                 הישגים ורמות יאבדו
//               </li>
//               <li className="flex items-center">
//                 <span className="ml-2">📱</span>
//                 לא יהיה ניתן לשחזר את החשבון
//               </li>
//             </ul>
//           </div>

//           <div className="flex flex-col space-y-2">
//             <button 
//               onClick={handleDelete} 
//               className={`w-full py-2 px-4 ${isLoading ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center`}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   מוחק חשבון...
//                 </>
//               ) : (
//                 <>
//                   <span className="mr-2">🗑️</span>
//                   מחק חשבון לצמיתות
//                 </>
//               )}
//             </button>
            
//             <a 
//               href="/"
//               className="text-blue-600 hover:text-blue-800 font-medium py-1 text-center block"
//               tabIndex={isLoading ? -1 : 0}
//             >
//               חזרה למסך הראשי
//             </a>
//           </div>
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteAccount;
"use client";

import { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast"; // Assuming you have react-hot-toast installed
import { useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom

// Import the CSS file
import "./DeleteAccount.css";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!password) {
      toast.error("אנא הכנס את הסיסמה שלך לאישור מחיקת החשבון");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
      console.log("Using base URL:", baseUrl);
      const accessToken = user?.accessToken;

      await axios.delete(`${baseUrl}/user/deleteUser`, {
        headers: {
          Authorization: `JWT ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          userId: user?._id,
          password: password,
        },
      });

      console.log("Account successfully deleted");

      setUser(null);

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      toast.success("החשבון נמחק בהצלחה");

      setSuccess(true);
      navigate("/"); // Redirect to home page after successful deletion
    } catch (err: any) {
      console.error("Error deleting account:", err);
      const errorMessage =
        err.response?.data?.message || "אירעה שגיאה במחיקת החשבון. אנא נסה שוב.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-green-100 rounded-lg shadow-lg my-4 border-2 border-green-300 rtl text-center">
        <h2 className="text-xl font-bold text-green-800 mb-2">
          ✅ החשבון נמחק בהצלחה
        </h2>
        <p className="text-gray-700">החשבון שלך נמחק בהצלחה מהמערכת.</p>
        <a href="/" className="block mt-4 text-blue-600 hover:underline">
          חזרה לדף הבית
        </a>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-red-600 text-xl mb-2">⚠️ מחיקת חשבון</h2>
      <p className="text-red-800 text-sm mb-4">
        האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו לא ניתנת לביטול ותאבד את
        כל הנתונים שלך.
      </p>

      <div className="delete-account-container">
        <div className="delete-account-header">
          <div className="warning-icon">⚠️</div>
          <h1>מחיקת חשבון</h1>
          <p>פעולה זו לא ניתנת לביטול!</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-3 border border-red-300">
            <p className="text-center font-semibold">{error}</p>
          </div>
        )}

        {/* Using CSS classes based on DeleteAccount.css */}
        <div className="space-y-3">
          <div className="delete-account-input-section">
            <label>🔒 הכנס סיסמה לאישור:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכנס את הסיסמה שלך"
              disabled={isLoading}
            />
            <div className="mt-1 p-2 bg-blue-50 text-sm text-blue-700 rounded-md border border-blue-200">
              <span className="font-bold">💡 טיפ:</span> משתמשי Google צריכים
              להקליד "GoogleUser" כסיסמה למחיקת החשבון
            </div>
          </div>

          <div className="delete-account-warning-box">
            <h3>⚠️ שים לב!</h3>
            <p>
              מחיקת הפרופיל תסיר את כל המידע האישי שלך באופן קבוע ולא יהיה ניתן
              לשחזרו
            </p>
            <ul>
              <li>
                <span>🗑️</span>
                כל הנתונים האישיים יימחקו
              </li>
              <li>
                <span>📧</span>
                היסטוריית המיילים תאבד
              </li>
              <li>
                <span>🏆</span>
                הישגים ורמות יאבדו
              </li>
              <li>
                <span>📱</span>
                לא יהיה ניתן לשחזר את החשבון
              </li>
            </ul>
          </div>

          <div className="delete-account-buttons">
            <button
              onClick={handleDelete}
              className={`delete-button ${
                isLoading ? "bg-gray-500 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  מוחק חשבון...
                </>
              ) : (
                <>
                  <span className="icon">🗑️</span>
                  מחק חשבון לצמיתות
                </>
              )}
            </button>

            {/* Changed to an <a> tag for navigation, matching the success state */}
            <a
              href="/"
              className="back-button"
              tabIndex={isLoading ? -1 : 0} // Make it unfocusable when loading
            >
              חזרה למסך הראשי
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;