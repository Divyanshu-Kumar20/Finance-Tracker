import axios from "axios"

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://finance-tracker-xzh4.onrender.com"
  }
  return "http://localhost:5000"
}

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
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

export const categorizeExpense = async (text) => {
  if (!text || !text.trim()) {
    return { category: "Other", aiConfidence: 0, aiCategorized: false }
  }
  try {
    const response = await api.post("/api/transactions/categorize", { text })
    return response.data
  } catch (error) {
    return { category: "Other", aiConfidence: 0, aiCategorized: false }
  }
}

export default api
