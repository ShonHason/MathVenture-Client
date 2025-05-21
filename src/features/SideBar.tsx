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
import "./SideBar.css";

const SideBar: React.FC = () => {
  const { isMenuHelpActive, setIsMenuHelpActive } = useContext(HelpContext)!;
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (isMenuHelpActive) navigate("/home/help");
  }, [isMenuHelpActive, navigate]);

  const onClickItem = (path: string) => {
    navigate(path);
    setIsMenuHelpActive(path === "/home/help");
  };

  return (
    <aside className="sidebar-modern">
      {/* קומפוננטת הפרופיל */}
      <Profile />

      {/* התפריט העליון */}
      <div className="sidebar-section">
        <div className="section-title">תפריט</div>
        <ul>
          <li
            className={`item ${isActive("/home") ? "active" : ""}`}
            onClick={() => onClickItem("/home")}
          >
            <span className="icon"><HomeOutlined /></span>
            <span className="label">בית</span>
          </li>
          <li
            className={`item ${isActive("/home/lessons") ? "active" : ""}`}
            onClick={() => onClickItem("/home/myLessons")}
          >
            <span className="icon"><BookOutlined /></span>
            <span className="label">כל השיעורים</span>
          </li>
    
        </ul>
      </div>

      {/* התפריט התחתון שדוחף אוטומטית לתחתית */}
      <div className="sidebar-section bottom-fixed">
        <ul>
          <li
            className={`item ${isActive("/home/profile") ? "active" : ""}`}
            onClick={() => onClickItem("/home/profile")}
          >
            <span className="icon"><UserOutlined /></span>
            <span className="label">פרופיל</span>
          </li>
          <li
            className={`item ${isActive("/home/help") ? "active" : ""}`}
            onClick={() => onClickItem("/home/help")}
          >
            <span className="icon"><QuestionCircleOutlined /></span>
            <span className="label">עזרה</span>
          </li>
          <li
            className={`item ${isActive("/home/settings") ? "active" : ""}`}
            onClick={() => onClickItem("/home/settings")}
          >
            <span className="icon"><SettingOutlined /></span>
            <span className="label">הגדרות</span>
          </li>
          <li className="item logout" onClick={() => navigate("/login")}>
            <span className="icon"><LogoutOutlined /></span>
            <span className="label">התנתק/י</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}; 

export default SideBar;
