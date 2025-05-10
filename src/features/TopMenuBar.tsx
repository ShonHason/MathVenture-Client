import React, { useState } from "react";
import "./TopMenuBar.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // עדכן את הנתיב לפי המיקום שלך

type TopMenuBarProps = {
  onEndLesson: () => Promise<void>;
};

const TopMenuBar: React.FC<TopMenuBarProps> = ({ onEndLesson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className={`top-menu-container ${isOpen ? "open" : ""}`}>
      <div className="top-bar">
        <div className="toggle-button" onClick={toggleMenu}>
          <div className={`arrow ${isOpen ? "up" : "down"}`}></div>
        </div>

        <div className={`menu-buttons ${isOpen ? "enter" : "exit"}`}>
          <div className="profile-section">
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="profile-image"
              />
            )}
            <span className="username">{user?.username}</span>
          </div>

          <button onClick={() => navigate("/home")}>🏠 דף הבית</button>
          <button>🔁 אתחל שיחה</button>
          <button onClick={onEndLesson}>🛑 סיים שיעור</button>
          <button>📋 סיכום</button>
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar;

// import React, { useState } from "react";
// import "./TopMenuBar.css";
// import { useNavigate } from "react-router-dom";

// const TopMenuBar: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleMenu = () => setIsOpen((prev) => !prev);
//   const navigate = useNavigate();

//   return (
//     <div className="top-menu-container">
//       <div className="top-bar">
//         <div className="toggle-button" onClick={toggleMenu}>
//           <div className={`arrow ${isOpen ? "up" : "down"}`}></div>
//         </div>

//         {/* Render always and apply class */}
//         <div className={`menu-buttons ${isOpen ? "enter" : "exit"}`}>
//           <button onClick={() => navigate("/home")}>🏠 דף הבית</button>
//           <button>🔁 אתחל שיחה</button>
//           <button>🛑 סיים שיעור</button>
//           <button>📋 סיכום</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TopMenuBar;
