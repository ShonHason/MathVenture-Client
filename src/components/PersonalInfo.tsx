import React, { useEffect, useState } from "react";
import "./PersonalInfo.css";
import defaultProfileImg from "../images/profile.png";
import EditIcon from "@mui/icons-material/Edit";
import { updateUserProfile } from "../services/user_api";
import { useUser } from "../context/UserContext";

const PersonalInfo = () => {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.parent_phone || "");
  const [className, setClassName] = useState(user?.grade || "");
  const [profileImage, setProfileImage] = useState(
    user?.imageUrl || defaultProfileImg
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfileImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    document.getElementById("imageUpload")?.click();
  };

  const onSaveButton = async (): Promise<void> => {
    try {
      if (!user?._id) {
        console.error("User ID not available in context");
        return;
      }

      const updatedData = {
        userId: user._id,
        username: name,
        email,
        parent_phone: phone,
        grade: className,
        imageUrl: profileImage,
      };

      const updatedUser = await updateUserProfile(updatedData);

      setUser((prevUser) => ({
        ...prevUser!,
        ...updatedUser,
      }));

      alert("הפרטים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("קרתה שגיאה בעת שמירת השינויים.");
    }
  };

  return (
    <div className="personal-info-container">
      <div className="personal-info-profile-image">
        <img
          src={profileImage}
          alt="Profile"
          className="profile-image-clickable"
          onClick={triggerImageUpload}
          style={{ cursor: "pointer" }} // הוספת סמן עכבר כדי לציין שאפשר ללחוץ
        />
        <div
          className="edit-icon-container"
          onClick={triggerImageUpload}
          style={{ cursor: "pointer" }}
        >
          <EditIcon fontSize="small" />
        </div>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* שאר הקוד של הטופס */}
      <div className="personal-info-input-group">
        <span className="inputs">
          <p>:שם מלא</p>
          <input
            className="input-obj"
            type="text"
            id="name"
            placeholder="הכנס שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </span>
        <span className="inputs">
          <p>:אימייל</p>
          <input
            className="input-obj"
            type="email"
            id="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </span>
        <span className="inputs">
          <p>:מספר טלפון</p>
          <input
            className="input-obj"
            type="tel"
            id="phone"
            placeholder="0504939124"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </span>
        <span className="inputs">
          <p>:כיתה</p>
          <input
            className="input-obj"
            type="text"
            id="class"
            placeholder=" הכנס כיתה"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </span>
      </div>
      <button className="personal-info-save-button" onClick={onSaveButton}>
        Save Change
      </button>
    </div>
  );
};

export default PersonalInfo;
