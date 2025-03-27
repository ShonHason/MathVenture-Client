import axios from "axios"

const basUrl = process.env.SERVER_API_URL;

const register = async(userDate:{
username: string;
email: string;
password:string;
parent_email: string;
parent_phone: string;
grade: string;
rank: string;
})=>{
const respone = await axios.post(`${basUrl}/register`);
localStorage.setItem("userId" , respone.data.userId);
localStorage.setItem("username" , respone.data.username);
localStorage.setItem("rank" , respone.data.rank);
localStorage.setItem("grade" , respone.data.grade);
localStorage.setItem("email" , respone.data.email);
localStorage.setItem("parent_email" , respone.data.parent_email);
localStorage.setItem("refreshToken" , respone.data.refreshToken);
localStorage.setItem("accessToken" , respone.data.accessToken); 
}


const checkTokenExp = async () => {
    console.log('Checking Refresh token...');
  
    const token = localStorage.getItem('accessToken');
    if (!token) return;
  
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1])); 
      const now = Math.floor(Date.now() / 1000); 
      const timeLeft = exp - now; 
  
      console.log(`Token expires in ${timeLeft} seconds`);
  
      if (timeLeft <= 120) { 
        console.log('Refreshing token...');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return;
        }
  
        const newToken = await axios.post((`${basUrl}/auth/refresh/`),{refreshToken});
        if (!newToken) {
          console.warn('Token refresh failed, redirecting to login');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          localStorage.removeItem("imgUrl");
          localStorage.clear();
          window.location.href = '/login';
        }
        localStorage.setItem('accessToken', newToken.data.accessToken);
        localStorage.setItem('refreshToken', newToken.data.refreshToken);
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Error checking token expiration', error);
    }
  };
  setInterval(checkTokenExp, 100000); 


const deleteUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    
    const response = await axios.delete(`${basUrl}/deleteUser`, {
      params: { userId: userId },
      headers: {
        Authorization: "jwt " + accessToken 
      }
    });
}

const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    try {
        const response = await axios.post(`${basUrl}/logout`, 
            { userId: userId }, 
            { 
                headers: {
                    Authorization: "jwt " + accessToken 
                }
            }
        );
        
        localStorage.clear();
        return response;
    } catch (error) {
        console.error("Error during logout:", error);
        localStorage.clear();
        throw error;
    }
};
