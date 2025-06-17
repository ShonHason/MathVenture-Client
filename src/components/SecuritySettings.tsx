import React from "react";
import "./SecuritySettings.css";
import { useUser } from "../context/UserContext"; // ודאי שהנתיב נכון

const SecuritySettings = () => {
  const { user } = useUser();

  return (
    <div className="security-settings-container">
      <div className="security-setting">
        <span>{user?.email || "לא ידוע"}</span>
        <p>:אימייל</p>
      </div>
      <span className="security-setting">
        <button>
          <span>שינוי סיסמא</span>
        </button>
        <p>:סיסמה</p>
      </span>
      <span className="security-setting">
        <span>{user?.parent_phone || "לא ידוע"}</span>
        <p>:מספר טלפון</p>
      </span>
      <span className="security-setting">
        <span>{user?.opportunities || "לא ידוע"}</span>
        <p>:מספר הזדמנויות</p>
      </span>
      <span className="security-setting security-setting-auth">
        <label className="toggle-container">
          <input
            type="checkbox"
            checked={user?.twoFactorAuth || false}
            readOnly
          />
        </label>
        <p>:אימות דו שלבי</p>
      </span>
      <div className="security-setting">
        <button className="security-setting-codes">Generate new codes</button>
      </div>
    </div>
  );
};

export default SecuritySettings;
