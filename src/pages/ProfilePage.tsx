// "use client";

// import type React from "react";
// import { useState } from "react";
// import { useUser } from "../context/UserContext";
// import MyEmails from "../components/MyEmails";
// import PersonalInfo from "../components/PersonalInfo";
// import DeleteAccount from "../components/DeleteAccount";

// const ProfilePage: React.FC = () => {
//   const { user } = useUser();
//   const [activeTab, setActiveTab] = useState<
//     "details" | "personal-area" | "delete-account" | "emails"
//   >("details");

//   return (
//     <div className="w-full max-w-screen-lg mx-auto p-4 h-[calc(100vh-120px)] flex flex-col relative overflow-visible">
//       {/* Tabs */}
//       <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
//         <button
//           className={`px-6 py-3 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 hover:scale-105 ${
//             activeTab === "details"
//               ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-105 border-2 border-yellow-300"
//               : "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 border-2 border-transparent hover:border-purple-300"
//           }`}
//           onClick={() => setActiveTab("details")}
//         >
//           <span className="text-xl mr-1">👤</span> הפרופיל שלי
//         </button>
//         <button
//           className={`px-6 py-3 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 hover:scale-105 ${
//             activeTab === "emails"
//               ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-105 border-2 border-yellow-300"
//               : "bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 border-2 border-transparent hover:border-purple-300"
//           }`}
//           onClick={() => setActiveTab("emails")}
//         >
//           <span className="text-xl mr-1">📬</span> המיילים שלי
//         </button>
//         <button
//           className={`px-6 py-3 rounded-2xl font-bold text-base shadow-lg transition-all duration-300 hover:scale-105 ${
//             activeTab === "delete-account"
//               ? "bg-gradient-to-r from-red-500 to-pink-500 text-white scale-105 border-2 border-yellow-300"
//               : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-transparent hover:border-red-300"
//           }`}
//           onClick={() => setActiveTab("delete-account")}
//         >
//           <span className="text-xl mr-1">🗑️</span> מחק חשבון
//         </button>
//       </div>

//       {/* Content */}
//       <div className="flex-1 mt-24 p-4 overflow-auto">
//         {activeTab === "details" && (
//           <div className="text-center">
//             <PersonalInfo />
//           </div>
//         )}
//         {activeTab === "emails" && user?._id && <MyEmails userId={user._id} />}
//         {activeTab === "delete-account" && (
//           <div className="text-center">
//             <h2 className="text-red-600 text-xl mb-2">⚠️ מחיקת חשבון</h2>
//             <p className="text-red-800 text-sm mb-4">
//               האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו לא ניתנת לביטול
//               ותאבד את כל הנתונים שלך.
//             </p>
//             <DeleteAccount />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
"use client";

import type React from "react";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import MyEmails from "../components/MyEmails";
import PersonalInfo from "../components/PersonalInfo";
import DeleteAccount from "../components/DeleteAccount";

// Import the CSS file
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "details" | "personal-area" | "delete-account" | "emails"
  >("details");

  return (
    <div className="profile-page-container">
      {/* Tabs */}
      <div className="profile-tabs-container">
        <button
          className={`profile-tab-button ${
            activeTab === "details" ? "active-purple" : ""
          }`}
          onClick={() => setActiveTab("details")}
        >
          <span>👤</span> הפרופיל שלי
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "emails" ? "active-purple" : ""
          }`}
          onClick={() => setActiveTab("emails")}
        >
          <span>📬</span> המיילים שלי
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "delete-account" ? "active-red" : "inactive-red" // This class is for the inactive hover state of the red button
          }`}
          onClick={() => setActiveTab("delete-account")}
        >
          <span>🗑️</span> מחק חשבון
        </button>
      </div>

      {/* Content */}
      <div className="profile-content-area">
        {activeTab === "details" && (
          <div className="text-center">
            {" "}
            {/* Retain text-center if it's applied to the content *inside* */}
            <PersonalInfo />
          </div>
        )}
        {activeTab === "emails" && user?._id && <MyEmails userId={user._id} />}
        {activeTab === "delete-account" && (
          <div className="delete-account-warning">
            <h2>⚠️ מחיקת חשבון</h2>
            <p>
              האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו לא ניתנת לביטול
              ותאבד את כל הנתונים שלך.
            </p>
            <DeleteAccount />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
