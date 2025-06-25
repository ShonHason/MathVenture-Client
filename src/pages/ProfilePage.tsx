// "use client"

// import type React from "react"
// import { useState } from "react"
// import { useUser } from "../context/UserContext"
// import MyEmails from "../components/MyEmails"
// import PersonalInfo from "../components/PersonalInfo"
// import DeleteAccount from "../components/DeleteAccount"

// const ProfilePage: React.FC = () => {
//   const { user } = useUser()
//   const [activeTab, setActiveTab] = useState<"details" | "personal-area" | "delete-account" | "emails">("details")

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
//         {activeTab === "delete-account" && <DeleteAccount />}
//       </div>
//     </div>
//   )
// }

// export default ProfilePage
"use client";

import type React from "react";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import MyEmails from "../components/MyEmails";
import PersonalInfo from "../components/PersonalInfo";
import DeleteAccount from "../components/DeleteAccount";

import "./ProfilePage.css"; // Import the new CSS file

const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "details" | "personal-area" | "delete-account" | "emails"
  >("details");

  return (
    <div className="profile-page-container">
      {/* Tabs */}
      <div className="profile-tabs-wrapper">
        <button
          className={`profile-tab-button ${
            activeTab === "details"
              ? "active-tab-details"
              : "inactive-tab-purple"
          }`}
          onClick={() => setActiveTab("details")}
        >
          <span className="profile-tab-icon">👤</span> הפרופיל שלי
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "emails"
              ? "active-tab-details"
              : "inactive-tab-purple"
          }`}
          onClick={() => setActiveTab("emails")}
        >
          <span className="profile-tab-icon">📬</span> המיילים שלי
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "delete-account"
              ? "active-tab-delete"
              : "inactive-tab-red"
          }`}
          onClick={() => setActiveTab("delete-account")}
        >
          <span className="profile-tab-icon">🗑️</span> מחק חשבון
        </button>
      </div>

      {/* Content */}
      <div className="profile-content-area">
        {activeTab === "details" && (
          <div className="profile-info-center">
            <PersonalInfo />
          </div>
        )}
        {activeTab === "emails" && user?._id && <MyEmails userId={user._id} />}
        {activeTab === "delete-account" && <DeleteAccount />}
      </div>
    </div>
  );
};

export default ProfilePage;
