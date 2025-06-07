import React, { useState } from "react";
import "./ProfilePage.css";
import PersonalInfo from "../components/PersonalInfo";
import PersonalArea from "../components/PersonalArea";
import DeleteAccount from "../components/DeleteAccount";
import MathMiniGame from "./MathMiniGame";
import MyEmails from "../components/MyEmails";
import { useUser } from "../context/UserContext"
const ProfilePage: React.FC = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<
    "details" | "personal-area" | "delete-account" | "emails"
  >("details");

  return (
    <div className="profile-page">
      {/* segmented control */}
      <div className="profile-tabs">
        <div
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          פרטים אישיים
        </div>
        <div
          className={`tab ${activeTab === "emails" ? "active" : ""}`}
          onClick={() => setActiveTab("emails")}
        >
         ✉️ מיילים ✉️
        </div>
        <div
          className={`tab ${activeTab === "delete-account" ? "active" : ""}`}
          onClick={() => setActiveTab("delete-account")}
        >
          מחיקת חשבון
        </div>
      </div>

      <div className="profile-content">
        {activeTab === "details" && <PersonalInfo />}
        {activeTab === "emails" && user?._id && (
        <MyEmails userId={user._id} />
      )}        {/* {activeTab === "personal-area" && <PersonalArea />} */}
        {activeTab === "delete-account" && <DeleteAccount />}
      </div>
    </div>
  );
};

export default ProfilePage;
