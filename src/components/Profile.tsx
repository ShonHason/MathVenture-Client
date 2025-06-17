import React from "react";
import defaultProfileImg from "../images/profile.png";
import "./Profile.css";
import { useUser } from "../context/UserContext";

function Profile() {
  const { user } = useUser();

  const name = user?.username || " ";

  const grade = user?.grade ? `כיתה ${user.grade}׳` : "";
  const profileImage = user?.imageUrl || defaultProfileImg;
  return (
    <div className="profile-container">
      <img src={profileImage} alt="profile" className="profile-picture" />
      <div className="name-class-container">
        <h1 className="profile-username">{name}</h1>
        <p className="profile-userclass">{grade}</p>
      </div>
    </div>
  );
}

export default Profile;
