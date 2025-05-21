import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../features/SideBar";
import "./HomeLayout.css";

const HomeLayout: React.FC = () => {
  return (
    <div className="home-layout">
      <SideBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;
