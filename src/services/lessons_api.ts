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
