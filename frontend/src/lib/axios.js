// utils/axios.js
import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:5001", // backend server URL
  withCredentials: true, // important for cookies (login/logout)
=======
  baseURL: "http://localhost:5000", // change to your backend URL
  withCredentials: true, // allows cookies/JWT if you're using them
>>>>>>> 6005b891557af2862ab3e100b426353d85df1a12
});

export default api;
