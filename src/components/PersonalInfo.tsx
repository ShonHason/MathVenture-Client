import React, { useEffect, useState } from "react";
import "./PersonalInfo.css";
import defaultProfileImg from "../images/profile.png";
import EditIcon from "@mui/icons-material/Edit";
import { updateUserProfile } from "../services/user_api";

const PersonalInfo = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("");
  const [profileImage, setProfileImage] = useState(defaultProfileImg);

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
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const updatedData = {
        userId,
        username: name,
        email,
        parent_phone: phone,
        grade: className,
        imageUrl: profileImage,
      };

      const response = await updateUserProfile(updatedData);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("parent_phone", phone);
      localStorage.setItem("grade", className);
      localStorage.setItem("imageUrl", profileImage); // הכי חשוב התמונה

      console.log("User profile updated successfully:", response);

      alert("הפרטים נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("קרתה שגיאה בעת שמירת השינויים.");
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("parent_phone");
    const storedClass = localStorage.getItem("grade");
    const storedImage = localStorage.getItem("imageUrl");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
    if (storedClass) setClassName(storedClass);
    if (storedImage) setProfileImage(storedImage);
  }, []);

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
