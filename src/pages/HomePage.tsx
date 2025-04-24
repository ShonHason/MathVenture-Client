import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../features/SideBar";
import { useLessons } from "../context/LessonsContext";
import "./HomePage.css";
import HomePageContent from "../ui/HomePageContent";

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const { setTopics } = useLessons();

  useEffect(() => {
    // Fetch user's lessons on mount
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`/lessons/users/${userId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch lessons");
          return res.json();
        })
        .then((data) => {
          // data is an array of LessonTopic
          setTopics(data);
        })
        .catch((err) => console.error(err));
    } else {
      console.warn("No userId found in localStorage");
      navigate("/login");
    }
  }, [setTopics, navigate]);

  return (
    <div className="homepage-container">
      <SideBar />
      <div className="outlet-container">
        {window.location.pathname === "/home" ? (
          <HomePageContent />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default HomePage;