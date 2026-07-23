import { createContext, useContext, useState, useEffect, useCallback } from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import api from "../utils/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage("token", null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async (jwtToken) => {
    if (!jwtToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await api.get("/api/auth/me")
      setUser(response.data.user)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch user profile:", err)
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [setToken])

  useEffect(() => {
    fetchUser(token)
  }, [token, fetchUser])

  const login = async (credentials) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/login", credentials)
      const { token: newToken, user: userData } = response.data
      setToken(newToken)
      setUser(userData)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please check your credentials."
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/api/auth/register", userData)
      const { token: newToken, user: newUser } = response.data
      setToken(newToken)
      setUser(newUser)
      return { success: true }
    } catch (err) {
      let message = "Registration failed."
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        message = err.response.data.errors.map((e) => e.message).join(". ")
      } else if (err.response?.data?.message) {
        message = err.response.data.message
      }
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
