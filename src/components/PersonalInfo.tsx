import React, { useState, useEffect, useRef, useMemo } from "react";
import "./PersonalInfo.css";
import defaultProfileImg from "../images/profile.png";
import { CameraOutlined, LockOutlined, EditOutlined } from "@ant-design/icons";
import { updateUserProfile } from "../services/user_api";
import { useUser } from "../context/UserContext";

const gradeOptions = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];

const prefixOptions = ["050", "051", "052", "053", "054", "055", "058"];

const PersonalInfo: React.FC = () => {
  const { user, setUser } = useUser();
  const avgScore = Number(user?.rank ?? 0);

  const { calculatedLevel, mappedRank } = useMemo(() => {
    let calculatedLevel = "";
    let mappedRank = "1";

    if (avgScore <= 2) {
      calculatedLevel = "🪱 תולעת חכמה";
      mappedRank = "1";
    } else if (avgScore <= 3.5) {
      calculatedLevel = "🐶 כלב מתמטי";
      mappedRank = "2";
    } else {
      calculatedLevel = "🐯 נמר מספרים";
      mappedRank = "3";
    }

    return { calculatedLevel, mappedRank };
  }, [avgScore]);
  const [name, setName] = useState(user?.username || "");
  const [email] = useState(user?.email || "");
  const [phonePrefix, setPhonePrefix] = useState(
    user?.parent_phone?.slice(0, 3) || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.parent_phone || "");
  const [className, setClassName] = useState(user?.grade || "");
  const [profileImage, setProfileImage] = useState<string>(
    user?.imageUrl || defaultProfileImg
  );
  const [parentName, setParentName] = useState(user?.parent_name || "");
  const [parentEmail, setParentEmail] = useState(user?.parent_email || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   if (user?.parent_phone) {
  //     const full = user.parent_phone;
  //     const found = prefixOptions.find((p) => full.startsWith(p));
  //     if (found) {
  //       setPhonePrefix(found);
  //       setPhoneNumber(full.slice(found.length));
  //     } else {
  //       setPhoneNumber(full);
  //     }
  //   }

  //   if (user?.parent_name) setParentName(user.parent_name);
  //   if (user?.parent_email) setParentEmail(user.parent_email);
  // }, [user]);
  useEffect(() => {
    if (!user) return;
    setName(user.username || user.fullname || "");
    setClassName(user.grade || "");
    setProfileImage(user.imageUrl || defaultProfileImg);
    setParentName(user.parent_name || "");
    setParentEmail(user.parent_email || "");

    if (user.parent_phone) {
      const full = user.parent_phone;
      const found = prefixOptions.find((p) => full.startsWith(p));
      if (found) {
        setPhonePrefix(found);
        setPhoneNumber(full.slice(found.length));
      } else {
        setPhoneNumber(full);
      }
    }
  }, [user]);

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!user?._id) return;
    const fullPhone = phonePrefix + phoneNumber;
    try {
      const updated = await updateUserProfile({
        userId: user._id,
        username: name,
        email,
        parent_phone: fullPhone,
        grade: className,
        imageUrl: profileImage,
        parent_name: parentName,
        parent_email: parentEmail,
      });
      console.log("Sending profile update:", {
        username: name,
        email,
        grade: className,
        imageUrl: profileImage,
        parent_name: parentName,
        parent_email: parentEmail,
      });
      setUser((prev) => ({ ...prev!, ...updated }));
      alert("השינויים נשמרו בהצלחה!");
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירת הפרטים");
    }
  };

  return (
    <div className="personal-info-container">
      <div className="profile-image-wrapper" onClick={triggerImageUpload}>
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="edit-icon-overlay">
          <EditOutlined />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="personal-info-form">
        {/* <div className="field">
          <label>רמת תלמיד</label>
          <div className="level-display">{calculatedLevel}</div>
        </div> */}

        <div className="field">
          <label>שם מלא</label>
          <input
            type="text"
            placeholder="הכנס שם מלא"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <div className="field">
          <label>שם הורה</label>
          <input
            type="text"
            placeholder="הכנס שם הורה"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>מייל הורה</label>
          <input
            type="email"
            placeholder="example@parent.com"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
        </div>

        <div className="field phone-field">
          <label>מספר טלפון</label>
          <div className="phone-inputs">
            <input
              type="tel"
              className="number-input"
              placeholder="1234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <span className="separator">–</span>
            <select
              className="prefix-select"
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
            >
              <option value="">קידומת</option>
              {prefixOptions.map((p) => (
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
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="">בחר כיתה</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>
                כיתה {g}
              </option>
            ))}
          </select>
        </div>

        <button className="save-btn" onClick={onSave}>
          שמור שינויים
        </button>
      </div>
    </div>
  );
};

export default PersonalInfo;