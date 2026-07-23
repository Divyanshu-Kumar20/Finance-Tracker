import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    try {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        // Parse if token is stored as JSON string from useLocalStorage
        const token = storedToken.startsWith('"') ? JSON.parse(storedToken) : storedToken
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch (e) {
      console.error("Error reading token from localStorage:", e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
