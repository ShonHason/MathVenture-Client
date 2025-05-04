import React, { useEffect, useState, useRef } from "react";
import "./PersonalInfo.css";
import defaultProfileImg from "../images/profile.png";
import {
  CameraOutlined,
  LockOutlined,
} from "@ant-design/icons";

// כל הכיתות א–יב
const gradeOptions = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "יא", "יב"];
// קידומות ישראליות נפוצות
const prefixOptions = ["050", "051", "052", "053", "054", "055", "058"];

const PersonalInfo: React.FC = () => {
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [phonePrefix, setPhonePrefix]   = useState("");
  const [phoneNumber, setPhoneNumber]   = useState("");
  const [className, setClassName]       = useState("");
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImg);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedName      = localStorage.getItem("name")    || "";
    const storedEmail     = localStorage.getItem("email")   || "";
    const storedClass     = localStorage.getItem("grade")   || "";
    const storedImage     = localStorage.getItem("imageUrl");
    const storedFullPhone = localStorage.getItem("phone")   || "";

    setName(storedName);
    setEmail(storedEmail);
    setClassName(storedClass);
    if (storedImage) {
      setProfileImage(storedImage);
    }

    if (storedFullPhone) {
      const foundPrefix = prefixOptions.find(p => storedFullPhone.startsWith(p));
      if (foundPrefix) {
        setPhonePrefix(foundPrefix);
        setPhoneNumber(storedFullPhone.slice(foundPrefix.length));
      } else {
        setPhoneNumber(storedFullPhone);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("grade", className);
    localStorage.setItem("imageUrl", profileImage);
    const fullPhone = phonePrefix + phoneNumber;
    localStorage.setItem("phone", fullPhone);

    alert("השינויים נשמרו!");
  };

  return (
    <div className="personal-info-container">
      <div
        className="profile-image-wrapper"
        onClick={() => fileInputRef.current?.click()}
      >
        <img src={profileImage} alt="Profile" className="profile-image" />
        <CameraOutlined className="camera-icon" />
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="file-input"
        onChange={handleFileChange}
      />

      <div className="personal-info-form">
        <div className="field">
          <label>שם מלא</label>
          <input
            type="text"
            placeholder="הכנס שם מלא"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="field email-field">
          <label>אימייל</label>
          <div className="email-input-wrapper">
            <input
              type="email"
              value={email}
              readOnly
              className="readonly-input"
            />
            <LockOutlined className="lock-icon" />
          </div>
        </div>

        <div className="field phone-field">
          <label>מספר טלפון</label>
          <div className="phone-inputs">
            <input
              type="tel"
              className="number-input"
              placeholder="1234567"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
            <span className="separator">–</span>
            <select
              className="prefix-select"
              value={phonePrefix}
              onChange={e => setPhonePrefix(e.target.value)}
            >
              <option value="">קידומת</option>
              {prefixOptions.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>כיתה</label>
          <select
            value={className}
            onChange={e => setClassName(e.target.value)}
          >
            <option value="">בחר כיתה</option>
            {gradeOptions.map(g => (
              <option key={g} value={g}>
                כיתה {g}
              </option>
            ))}
          </select>
        </div>

        <button className="save-btn" onClick={handleSave}>
          שמור שינויים
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;
