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
const startLesson = async (userSubject: {
  subject: string;
}) => {  

  const userData = {
    userId: localStorage.getItem("userId"),
    grade: localStorage.getItem("grade"),
    rank : localStorage.getItem("rank"),
    subject: userSubject.subject,
  };  

  const accessToken = localStorage.getItem("accessToken");
  const response = await axios.post(`${process.env.API_URL}/lessons/start`, userData, {
    headers: {
      Authorization: "jwt " + accessToken,  // השתמשתי במשתנה במקום לקרוא שוב מ-localStorage
    },
  });

  return response.data;
};


//const getDynamicQuestion 
//should send grade + rank + subject

//const updateCurnnetSubjectList []מערך של נושאים כל נושא מופיע בשורה אחרת כלומר שימוש בmap

//const getCurrentSubjectList [] 

//localstorage=userId,Username,email,parent_email,token,grade,rank,subjects[]?

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
