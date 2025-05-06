import axios from "axios";
const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
import { User } from "../context/UserContext";

export const getAllLessonsByUserId = async (
  userId: string
): Promise<string[]> => {
  const response = await axios.get(`${baseUrl}/lessons/${userId}`, {
    headers: {
      Authorization: "jwt " + localStorage.getItem("accessToken"),
    },
  });
  return response.data.topics; // הנחה שהתשובה נראית ככה: { topics: ["נושא 1", "נושא 2", ...] }
};
export const getCurrentSubjectList = async (
  userId: string
): Promise<string[]> => {
  const response = await axios.get(
    `${baseUrl}/subjects/${userId}`,
    {
      headers: {
        Authorization: "jwt " + localStorage.getItem("accessToken"),
      },
    }
  );

  const topics = response.data.topics;
  localStorage.setItem("subjects", JSON.stringify(topics)); // שמירה ב-localStorage כמחרוזת JSON
  return topics;
};

export const updateCurrentSubjectList = async (
  userId: string,
  topic: string
): Promise<string[]> => {
  const currentTopics = await getCurrentSubjectList(userId);

  if (currentTopics.includes(topic)) {
    await axios.delete(`${process.env.API_URL}/subjects`, {
      data: { userId, topic },
      headers: {
        Authorization: "jwt " + localStorage.getItem("accessToken"),
      },
    });
  } else {
    await axios.post(
      `${process.env.API_URL}/subjects`,
      { userId, topic },
      {
        headers: {
          Authorization: "jwt " + localStorage.getItem("accessToken"),
        },
      }
    );
  }

  // קבלת רשימה מעודכנת ועדכון ה-localStorage
  const updatedTopics = await getCurrentSubjectList(userId);
  localStorage.setItem("subjects", JSON.stringify(updatedTopics));
  return updatedTopics;
};

export interface StartLessonPayload {
  userId: string;
  grade?: string;
  rank?: string;
  username?: string;
  subject: string;
}

export interface StartLessonResponse {
  _id: string;
}

export const startLesson = async (
  user: User,
  subject: string,
  lessonId?: string
): Promise<StartLessonResponse> => {
  const endpoint = lessonId
    ? `${baseUrl}/lessons/start/${lessonId}`
    : `${baseUrl}/lessons/start`;

  console.log("endpoint: ", endpoint);
  const payload = {
    userId:   user._id,
    grade:    user.grade,
    rank:     user.rank,
    username: user.username,
    subject,
  };

  const response = await axios.post(
    endpoint,
    payload,
    {
      headers: {
        Authorization: `jwt ${user.accessToken}`,
      },
    }
  );
  console.log("lessonid: ", lessonId);
  return response.data;
};


//const getDynamicQuestion 
//should send grade + rank + subject


const deleteLesson = async (lessonId:string ) => {
const response = await axios.delete(`${baseUrl}/deleteLesson/${lessonId}`, {
  headers: {
    Authorization: "jwt " + localStorage.getItem("accessToken"),
  },
});
return response.data;

}

