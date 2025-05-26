import React, { useRef, useState, useEffect } from "react";
import "./TopMenuBar.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logo from "../images/full_logo2.png";
type TopMenuBarProps = {
  onEndLesson: () => Promise<void>;
  className?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TopMenuBar: React.FC<TopMenuBarProps> = ({
  onEndLesson,
  isOpen,
  setIsOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useUser();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const menu = menuRef.current;
    const content = contentRef.current;
    if (!menu || !content) return;

    if (isOpen) {
      menu.style.maxHeight = content.scrollHeight + "px";
      // menu.style.maxHeight = content.scrollHeight + "px";
    } else {
      menu.style.maxHeight = "0px";
    }
  }, [isOpen]);

  return (
    <div className="top-menu-inline-wrapper">
      <div className="menu-panel-col">
        <div ref={menuRef} className="menu-slide-down">
          <div ref={contentRef} className="menu-inner">
            {/* <button className="logo-home-button"> */}
            <img
              src={logo}
              alt="Logo"
              className="logo-image"
              onClick={() => navigate("/home")}
              title="go to home"
            />
            {/* </button> */}
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
    </div>
  );
};

export default TopMenuBar;
