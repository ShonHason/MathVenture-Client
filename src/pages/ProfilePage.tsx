import React, { useState } from "react";
import "./ProfilePage.css";
import PersonalInfo from "../components/PersonalInfo";
import PersonalArea from "../components/PersonalArea";
import DeleteAccount from "../components/DeleteAccount";
import MathMiniGame from "./MathMiniGame";

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "personal-area" | "delete-account" | "math-mini-game"
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
          className={`tab ${activeTab === "math-mini-game" ? "active" : ""}`}
          onClick={() => setActiveTab("math-mini-game")}
        >
          🎮 משחקים חינוכיים
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
        {activeTab === "math-mini-game" && <MathMiniGame />}
        {/* {activeTab === "personal-area" && <PersonalArea />} */}
        {activeTab === "delete-account" && <DeleteAccount />}
      </div>
    </div>
  );
};

export default ProfilePage;
