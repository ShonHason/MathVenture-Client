import React, { useEffect, useState } from "react";
import "./SecuritySettings.css";

const SecuritySettings = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [opportunities, setOpportunities] = useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("parent_phone");
    const storedOpportunities = localStorage.getItem("opportunities");
    const stored2FA = localStorage.getItem("twoFactorAuth");

    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
    if (storedOpportunities) setOpportunities(storedOpportunities);
    if (stored2FA) setIsTwoFactorEnabled(stored2FA === "true");
  }, []);

  return (
    <div className="security-settings-container">
      <div className="security-setting">
        <span>{email}</span>
        <p>:אימייל</p>
      </div>
      <div className="security-setting">
        <button>
          <span>שינוי סיסמא</span>
        </button>
        <p>:סיסמה</p>
      </div>
      <div className="security-setting">
        <span>{phone}</span>
        <p>:מספר טלפון</p>
      </div>
      <div className="security-setting">
        <span>{opportunities}</span>
        <p>:מספר הזדמנויות</p>
      </div>
      <div className="security-setting security-setting-auth">
        <label className="toggle-container">
          <input type="checkbox" checked={isTwoFactorEnabled} readOnly />
        </label>
        <p>:אימות דו שלבי</p>
      </div>
      <div className="security-setting">
        <button className="security-setting-codes">Generate new codes</button>
      </div>
    </div>
  );
};

export default SecuritySettings;
