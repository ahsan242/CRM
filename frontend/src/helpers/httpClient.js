import axios from 'axios';
const api = axios.create({
  baseURL: "http://localhost:5000", // 👈 point to your backend
  withCredentials: true, // only if you’re using cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function HttpClient() {
  
  return {
    get: axios.get,
    post: axios.post,
    patch: axios.patch,
    put: axios.put,
    delete: axios.delete
  };
}
export default HttpClient();