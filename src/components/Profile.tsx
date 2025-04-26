import React from "react";
import defaultProfileImg from "../images/profile.png";
import "./Profile.css";

function Profile() {
  const storedName = localStorage.getItem("name") || "תלמיד/ה";
  const rawGrade = localStorage.getItem("grade") || "";
  const storedClass = `כיתה ${rawGrade}׳`;
  const storedImage = localStorage.getItem("imageUrl") || defaultProfileImg;

  return (
    <div className="profile-container">
      <img src={storedImage} alt="profile" className="profile-picture" />
      <div className="name-class-container">
        <h1 className="profile-username">{storedName}</h1>
        <p className="profile-userclass">{storedClass}</p>
      </div>
    </div>
  );
}

export default Profile;
