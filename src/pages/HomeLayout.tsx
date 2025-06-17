import React from "react";
import { Outlet } from "react-router-dom";
import { useDisplaySettings } from "../context/DisplaySettingsContext"; // ✅ Add this
import SideBar from "../features/SideBar";
import "./HomeLayout.css";

const HomeLayout: React.FC = () => {
  const { fontSize, lineHeight, theme } = useDisplaySettings(); // ✅ Use context values

  return (
    <div
      className="home-layout"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight.toString(),
      }}
      data-theme={theme} // optional redundancy; main theme already handled on <html>
    >
      <SideBar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;

// import React from "react";
// import { Outlet } from "react-router-dom";
// import SideBar from "../features/SideBar";
// import "./HomeLayout.css";

// const HomeLayout: React.FC = () => {
//   return (
//     <div className="home-layout">
//       <SideBar />
//       <main className="main-content">
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default HomeLayout;
