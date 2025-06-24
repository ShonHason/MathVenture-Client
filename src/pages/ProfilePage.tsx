
// "use client";

// import type React from "react";
// import { useState } from "react";
// import { useUser } from "../context/UserContext";
// import MyEmails from "../components/MyEmails";
// import PersonalInfo from "../components/PersonalInfo";
// import DeleteAccount from "../components/DeleteAccount";

// // Import the CSS file
// import "./ProfilePage.css";

// const ProfilePage: React.FC = () => {
//   const { user } = useUser();
//   const [activeTab, setActiveTab] = useState<
//     "details" | "personal-area" | "delete-account" | "emails"
//   >("details");

//   return (
//     <div className="profile-page-container">
//       {/* Tabs */}
//       <div className="profile-tabs-container">
//         <button
//           className={`profile-tab-button ${
//             activeTab === "details" ? "active-purple" : ""
//           }`}
//           onClick={() => setActiveTab("details")}
//         >
//           <span>👤</span> הפרופיל שלי
//         </button>
//         <button
//           className={`profile-tab-button ${
//             activeTab === "emails" ? "active-purple" : ""
//           }`}
//           onClick={() => setActiveTab("emails")}
//         >
//           <span>📬</span> המיילים שלי
//         </button>
//         <button
//           className={`profile-tab-button ${
//             activeTab === "delete-account" ? "active-red" : "inactive-red" // This class is for the inactive hover state of the red button
//           }`}
//           onClick={() => setActiveTab("delete-account")}
//         >
//           <span>🗑️</span> מחק חשבון
//         </button>
//       </div>

//       {/* Content */}
//       <div className="profile-content-area">
//         {activeTab === "details" && (
//           <div className="text-center">
//             {" "}
//             {/* Retain text-center if it's applied to the content *inside* */}
//             <PersonalInfo />
//           </div>
//         )}
//         {activeTab === "emails" && user?._id && <MyEmails userId={user._id} />}
// <<<<<<< HEAD
//         {activeTab === "delete-account" && (
//           <div className="delete-account-warning">
//             <h2>⚠️ מחיקת חשבון</h2>
//             <p>
//               האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו לא ניתנת לביטול
//               ותאבד את כל הנתונים שלך.
//             </p>
//             <DeleteAccount />
//           </div>
//         )}
// =======
//         {activeTab === "delete-account" && <DeleteAccount />}
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
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