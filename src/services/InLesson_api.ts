import axios from "axios";
import exp from "constants";
const baseUrl = process.env.SERVER_API_URL;

    export const timeOut = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/time-out`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }
    export const explanation = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/explanation`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }
    export const slow = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/slow`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }

    export const scan = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/scan`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }
    export const clean = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/clean`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }
    export const endLesson = async (lessonId: string) => {
        try {
            const response = await axios.post(
            `${baseUrl}/lesson/end-lesson`,
            { lessonId },
            {
                headers: {
                Authorization: "jwt " + localStorage.getItem("accessToken"),
                },
            }
            );
            return response.data;
        } catch (error) {
            console.error("Error stopping lesson:", error);
            throw error;
        }
    }
