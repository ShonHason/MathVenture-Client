import axios from "axios";
const baseUrl = process.env.SERVER_API_URL;

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





//const getDynamicQuestion 
//should send grade + rank + subject




const continueLesson = async (userSubject: {
  lessonId: string;
}) => {
  const userData = {
    userId: localStorage.getItem("userId"),
    lessonId: userSubject.lessonId,
  };
  const response = await axios.post(`${process.env.API_URL}/lessons/continue`, userData, {
    headers: {
      Authorization: "jwt " + localStorage.getItem("accessToken"),
    },
  });
  return response.data;
}
const deleteLesson = async (lessonId:string ) => {
const response = await axios.delete(`${baseUrl}/deleteLesson/${lessonId}`, {
  headers: {
    Authorization: "jwt " + localStorage.getItem("accessToken"),
  },
});
return response.data;

}

