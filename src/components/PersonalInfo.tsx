import React, { useEffect, useState } from "react";
import "./PersonalInfo.css";
import profileImg from "../images/profile.png";

const PersonalInfo = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("parent_phone");
    const storedClass = localStorage.getItem("grade");

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
    if (storedClass) setClassName(storedClass);
  }, []);

  return (
    <div className="personal-info-container">
      <div className="personal-info-profile-image">
        <img src={profileImg} alt="Profile" />
      </div>
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
      <button
        className="personal-info-save-button"
        onClick={() => {
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          localStorage.setItem("phone", phone);
          localStorage.setItem("class", className);
        }}
      >
        Save Change
      </button>
    </div>
  );
};

export default PersonalInfo;
