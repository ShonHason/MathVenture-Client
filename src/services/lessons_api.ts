import axios from "axios";
import { User } from "../context/UserContext";
import { sampleQuestionsByGrade } from "../components/SampleQuestionsByGrade";
const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";

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
  const response = await axios.get(`${baseUrl}/subjects/${userId}`, {
    headers: {
      Authorization: "jwt " + localStorage.getItem("accessToken"),
    },
  });

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
  mathQuestionsCount: number;
}

export const startLesson = async (
  user: User,
  subject: string,
  lessonId?: string
): Promise<StartLessonResponse> => {
  const endpoint = lessonId
    ? `${baseUrl}/lessons/start/${lessonId}`
    : `${baseUrl}/lessons/start`;

  const grade = user.grade ?? "defaultGrade"; // Replace "defaultGrade" with an appropriate fallback value
  const sampleQuestions = sampleQuestionsByGrade[grade]?.[subject] || [];

  console.log("endpoint: ", endpoint);
  const payload = {
    userId: user._id,
    grade: user.grade,
    rank: user.rank,
    username: user.username,
    subject,
    sampleQuestions,
  };
  console.log("sampleQustions: ", sampleQuestions);
  const response = await axios.post(endpoint, payload, {
    headers: {
      Authorization: `jwt ${user.accessToken}`,
    },
  });
  console.log("lessonid: ", lessonId);
  return response.data as StartLessonResponse;
};

//const getDynamicQuestion
//should send grade + rank + subject

const deleteLesson = async (lessonId: string) => {
  const response = await axios.delete(`${baseUrl}/deleteLesson/${lessonId}`, {
    headers: {
      Authorization: "jwt " + localStorage.getItem("accessToken"),
    },
  });
  return response.data;
};
export async function checkOpenLesson(userId: string, subject: string) {
  console.log("Send Req to :", `${baseUrl}/lessons/check-open-lesson`);
  const response = await axios.post(`${baseUrl}/lessons/check-open-lesson`, {
    userId,
    subject,
  });
  return response.data;
}
export async function finishLessonFunction(
  lessonId: string,
  user: User,
  subject: string
) {
  console.log("Send Req to :", `${baseUrl}/lessons/analyze-lesson`);
  const subjectText = "סיכום שיעור בנושא " + subject + " לכיתה " + user?.grade;
  const body = {
    lessonId: lessonId,
    user: user,
    subject: subjectText,
  };
  const response = await axios.post(`${baseUrl}/lessons/analyze-lesson`, body, {
    headers: {
      Authorization: "jwt " + localStorage.getItem("accessToken"),
    },
  });
  return response.data;
}
