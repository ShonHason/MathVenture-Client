import React, { useState } from "react";
import "./TopMenuBar.css";

const TopMenuBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="top-menu-container">
      <div className="top-bar">
        <div className="toggle-button" onClick={toggleMenu}>
          <div className={`arrow ${isOpen ? "up" : "down"}`}></div>
        </div>

        {/* Render always and apply class */}
        <div className={`menu-buttons ${isOpen ? "enter" : "exit"}`}>
          <button>🏠 דף הבית</button>
          <button>🔁 אתחל שיחה</button>
          <button>🛑 סיים שיעור</button>
          <button>📋 סיכום</button>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar;
