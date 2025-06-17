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

// const SideBar: React.FC = () => {
//   const { user } = useUser();
//   const { isMenuHelpActive, setIsMenuHelpActive } = useContext(HelpContext)!;
//   const navigate = useNavigate();
//   const location = useLocation();

//   const isActive = (path: string) => location.pathname === path;

//   useEffect(() => {
//     if (isMenuHelpActive) navigate("/home/help");
//   }, [isMenuHelpActive, navigate]);

//   const onClickItem = (path: string) => {
//     navigate(path);
//     setIsMenuHelpActive(path === "/home/help");
//   };

//   return (
//     <aside className="h-screen w-64 bg-gradient-to-b from-purple-100 to-blue-100 shadow-lg flex flex-col fixed right-0 rtl rounded-l-2xl overflow-hidden border-l-4 border-yellow-300">
//       {/* Profile component */}
//       <div className="px-4 py-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-bl-2xl shadow-sm">
//         <div className="flex flex-col items-center">
//           {/* Made the mathventure text barely visible */}
//           <span className="text-xs opacity-70 text-gray-400 mb-1 block">
//             @mathventure
//           </span>
//           <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 border-white shadow-sm mb-2">
//             <div className="scale-100">
//               <Profile />
//             </div>
//           </div>
//           {/* User information below profile */}
//           <div className="text-center">
//             <h3 className="font-bold text-indigo-800">{user?.username}</h3>
//             <p className="text-sm text-indigo-600">כיתה {user?.grade}</p>
//           </div>
//         </div>
//       </div>

//       {/* Main content container with consistent padding */}
//       <div className="px-4 py-2 flex-1 flex flex-col">
//         {/* Top menu - uniform spacing */}
//         <div>
//           <ul className="space-y-2">
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home")
//                   ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-md"
//                   : "bg-white/70 text-indigo-600 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home")}
//             >
//               <div
//                 className={`w-10 h-10 flex items-center justify-center rounded-lg mr-3 ${
//                   isActive("/home") ? "bg-white/30" : "bg-indigo-100"
//                 }`}
//               >
//                 <HomeOutlined className="text-xl" />
//               </div>
//               <span className="font-bold text-lg">בית</span>
//             </li>
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home/myLessons")
//                   ? "bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-md"
//                   : "bg-white/70 text-indigo-600 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home/myLessons")}
//             >
//               <div
//                 className={`w-10 h-10 flex items-center justify-center rounded-lg mr-3 ${
//                   isActive("/home/myLessons") ? "bg-white/30" : "bg-indigo-100"
//                 }`}
//               >
//                 <BookOutlined className="text-xl" />
//               </div>
//               <span className="font-bold text-lg">שיעורים</span>
//             </li>
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home/GameSelection")
//                   ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-md"
//                   : "bg-white/70 text-indigo-600 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home/GameSelection")}
//             >
//               <div
//                 className={`w-10 h-10 flex items-center justify-center rounded-lg mr-3 ${
//                   isActive("/home/GameSelection")
//                     ? "bg-white/30"
//                     : "bg-indigo-100"
//                 }`}
//               >
//                 <PlayCircleOutlined className="text-xl" />
//               </div>
//               <span className="font-bold text-lg">משחקים</span>
//             </li>
//           </ul>
//         </div>

//         {/* Simple thin divider */}
//         <div className="my-2">
//           <div className="border-t border-white/40"></div>
//         </div>

//         {/* Bottom menu - same spacing as top menu */}
//         <div>
//           <ul className="space-y-2">
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home/profile")
//                   ? "bg-pink-200 text-pink-600 shadow-md"
//                   : "bg-white/70 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home/profile")}
//             >
//               <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-pink-100 mr-3">
//                 <UserOutlined className="text-xl text-pink-500" />
//               </div>
//               <span className="font-bold text-lg">פרופיל</span>
//             </li>
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home/help")
//                   ? "bg-purple-200 text-purple-600 shadow-md"
//                   : "bg-white/70 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home/help")}
//             >
//               <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-100 mr-3">
//                 <QuestionCircleOutlined className="text-xl text-purple-500" />
//               </div>
//               <span className="font-bold text-lg">עזרה</span>
//             </li>
//             <li
//               className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
//                 isActive("/home/settings")
//                   ? "bg-blue-200 text-blue-600 shadow-md"
//                   : "bg-white/70 hover:bg-white/90 hover:shadow-sm"
//               }`}
//               onClick={() => onClickItem("/home/settings")}
//             >
//               <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 mr-3">
//                 <SettingOutlined className="text-xl text-blue-500" />
//               </div>
//               <span className="font-bold text-lg">הגדרות</span>
//             </li>
//             <li
//               className="flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 bg-white/70 hover:bg-red-50 text-red-500"
//               onClick={() => navigate("/login")}
//             >
//               <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 mr-3">
//                 <LogoutOutlined className="text-xl text-red-500" />
//               </div>
//               <span className="font-bold text-lg">התנתק/י</span>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default SideBar;
// Sidebar.tsx
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
          <div className="user-info">
            <h3>{user?.username}</h3>
            <p>כיתה {user?.grade}</p>
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
