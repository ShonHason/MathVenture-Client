import axios from "axios";

export const getAllLessonsByUserId = async (
  userId: string
): Promise<string[]> => {
  const response = await axios.get(`${process.env.API_URL}/lessons/${userId}`, {
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
    `${process.env.API_URL}/subjects/${userId}`,
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

/*
const startLesson()שולח את השם +כיתה דירוג התלמיד ונושא השיעור הנבחר

const getAllLessonsByUser

const getDynamicQuestion 
#should send grade + rank + subject

const sendUser*/

//const updateCurnnetSunjectList []מערך של נושאים כל נושא מופיע בשורה אחרת כלומר שימוש בmap

// const getCurrentSubjectList []

//continueLesson() השיעור מה27.3 של רותם על חיסור על 50

//localstorage=userId,Username,email,parent_email,token,grade,rank,subjects[]?
