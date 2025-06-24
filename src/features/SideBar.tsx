
// import React, { useContext, useEffect } from "react";
// import {
//   HomeOutlined,
//   BookOutlined,
//   PlayCircleOutlined,
//   UserOutlined,
//   QuestionCircleOutlined,
//   SettingOutlined,
//   LogoutOutlined,
// } from "@ant-design/icons";
// import { useNavigate, useLocation } from "react-router-dom";
// import HelpContext from "../context/HelpContext";
// import Profile from "../components/Profile";
// import { useUser } from "../context/UserContext";

// import "./SideBar.css";

// const SideBar: React.FC = () => {
//   const { user } = useUser();
//   const { isMenuHelpActive, setIsMenuHelpActive } = useContext(HelpContext)!;
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Helper function to check if a path is active
//   const isActive = (path: string) => location.pathname === path;

//   useEffect(() => {
//     if (isMenuHelpActive) navigate("/home/help");
//   }, [isMenuHelpActive, navigate]);

//   const onClickItem = (path: string) => {
//     navigate(path);
//     setIsMenuHelpActive(path === "/home/help");
//   };

//   return (
//     <aside className="sidebar-container">
//       {/* Profile component */}
//       <div className="profile-section">
//         <div className="flex flex-col items-center">
//           {" "}
//           {/* Keep flexbox here for nested alignment */}
//           {/* Made the mathventure text barely visible */}
//           <span className="mathventure-text">@mathventure</span>
//           <div className="profile-image-container">
//             <div>
//               {" "}
//               {/* This div corresponds to the scale-100, which is covered by the CSS scale(1) */}
//               <Profile />
//             </div>
//           </div>
//           {/* User information below profile */}
// <<<<<<< HEAD
//           <div className="user-info">
//             <h3>{user?.username}</h3>
//             <p>כיתה {user?.grade}</p>
// =======
//           <div className="text-center">
//             <h3 className="font-bold text-indigo-800">{user?.username}</h3>
//             <p className="text-sm text-indigo-600">כיתה {user?.grade}'</p>
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//           </div>
//         </div>
//       </div>

//       {/* Main content container with consistent padding */}
//       <div className="sidebar-main-content">
//         {/* Top menu - uniform spacing */}
//         <div>
//           <ul className="sidebar-menu-list">
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home") ? "active-home" : ""
//               }`}
//               onClick={() => onClickItem("/home")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <HomeOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">בית</span>
//             </li>
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home/myLessons") ? "active-lessons" : ""
//               }`}
//               onClick={() => onClickItem("/home/myLessons")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <BookOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">שיעורים</span>
//             </li>
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home/GameSelection") ? "active-games" : ""
//               }`}
//               onClick={() => onClickItem("/home/GameSelection")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <PlayCircleOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">משחקים</span>
//             </li>
//           </ul>
//         </div>

//         {/* Simple thin divider */}
//         <div className="sidebar-divider">
//           <div></div>
//         </div>

//         {/* Bottom menu - same spacing as top menu */}
//         <div>
//           <ul className="sidebar-menu-list">
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home/profile") ? "active-profile" : ""
//               }`}
//               onClick={() => onClickItem("/home/profile")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <UserOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">פרופיל</span>
//             </li>
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home/help") ? "active-help" : ""
//               }`}
//               onClick={() => onClickItem("/home/help")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <QuestionCircleOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">עזרה</span>
//             </li>
//             <li
//               className={`sidebar-menu-item ${
//                 isActive("/home/settings") ? "active-settings" : ""
//               }`}
//               onClick={() => onClickItem("/home/settings")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <SettingOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">הגדרות</span>
//             </li>
//             <li
//               className="sidebar-menu-item logout-item"
//               onClick={() => navigate("/login")}
//             >
//               <div className="sidebar-menu-item-icon-wrapper">
//                 <LogoutOutlined className="sidebar-menu-item-icon" />
//               </div>
//               <span className="sidebar-menu-item-text">התנתק/י</span>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default SideBar;
import React, { useContext, useEffect } from "react";
import {
  HomeOutlined,
  BookOutlined,
  PlayCircleOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import HelpContext from "../context/HelpContext";
import Profile from "../components/Profile";
import { useUser } from "../context/UserContext";

import "./SideBar.css";

const SideBar: React.FC = () => {
  const { user } = useUser();
  const { isMenuHelpActive, setIsMenuHelpActive } = useContext(HelpContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if a path is active
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isMenuHelpActive) navigate("/home/help");
  }, [isMenuHelpActive, navigate]);

  const onClickItem = (path: string) => {
    navigate(path);
    setIsMenuHelpActive(path === "/home/help");
  };

  return (
    <aside className="sidebar-container">
      {/* Profile component */}
      <div className="profile-section">
        <div className="flex flex-col items-center">
          {" "}
          {/* Keep flexbox here for nested alignment */}
          {/* Made the mathventure text barely visible */}
          <span className="mathventure-text">@mathventure</span>
          <div className="profile-image-container">
            <div>
              {" "}
              {/* This div corresponds to the scale-100, which is covered by the CSS scale(1) */}
              <Profile />
            </div>
          </div>
          {/* User information below profile */}
          <div className="user-info"> {/* Merged: Kept your class */}
            <h3>{user?.username}</h3>
            <p>כיתה {user?.grade}'</p> {/* Merged: Added the apostrophe from their version */}
          </div>
        </div>
      </div>

      {/* Main content container with consistent padding */}
      <div className="sidebar-main-content">
        {/* Top menu - uniform spacing */}
        <div>
          <ul className="sidebar-menu-list">
            <li
              className={`sidebar-menu-item ${
                isActive("/home") ? "active-home" : ""
              }`}
              onClick={() => onClickItem("/home")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <HomeOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">בית</span>
            </li>
            <li
              className={`sidebar-menu-item ${
                isActive("/home/myLessons") ? "active-lessons" : ""
              }`}
              onClick={() => onClickItem("/home/myLessons")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <BookOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">שיעורים</span>
            </li>
            <li
              className={`sidebar-menu-item ${
                isActive("/home/GameSelection") ? "active-games" : ""
              }`}
              onClick={() => onClickItem("/home/GameSelection")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <PlayCircleOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">משחקים</span>
            </li>
          </ul>
        </div>

        {/* Simple thin divider */}
        <div className="sidebar-divider">
          <div></div>
        </div>

        {/* Bottom menu - same spacing as top menu */}
        <div>
          <ul className="sidebar-menu-list">
            <li
              className={`sidebar-menu-item ${
                isActive("/home/profile") ? "active-profile" : ""
              }`}
              onClick={() => onClickItem("/home/profile")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <UserOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">פרופיל</span>
            </li>
            <li
              className={`sidebar-menu-item ${
                isActive("/home/help") ? "active-help" : ""
              }`}
              onClick={() => onClickItem("/home/help")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <QuestionCircleOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">עזרה</span>
            </li>
            <li
              className={`sidebar-menu-item ${
                isActive("/home/settings") ? "active-settings" : ""
              }`}
              onClick={() => onClickItem("/home/settings")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <SettingOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">הגדרות</span>
            </li>
            <li
              className="sidebar-menu-item logout-item"
              onClick={() => navigate("/login")}
            >
              <div className="sidebar-menu-item-icon-wrapper">
                <LogoutOutlined className="sidebar-menu-item-icon" />
              </div>
              <span className="sidebar-menu-item-text">התנתק/י</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;