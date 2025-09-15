// utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // change to your backend URL
  withCredentials: true, // allows cookies/JWT if you're using them
});

export default api;
