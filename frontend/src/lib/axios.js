import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // backend server URL
  withCredentials: true, // important for cookies (login/logout)
});

export default api;
