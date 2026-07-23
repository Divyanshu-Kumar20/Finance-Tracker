import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function AuthScreen() {
  const { login, register, error, setError } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleMode = (mode) => {
    setIsRegister(mode)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isRegister) {
      if (!form.name || !form.email || !form.password) {
        setError("All fields are required")
        setLoading(false)
        return
      }
      await register({ name: form.name, email: form.email, password: form.password })
    } else {
      if (!form.email || !form.password) {
        setError("Email and password are required")
        setLoading(false)
        return
      }
      await login({ email: form.email, password: form.password })
    }

    setLoading(false)
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", marginBottom: "6px" }}>
            💰 Finance Tracker
          </h1>
          <p style={{ fontSize: "13px", color: "#666" }}>
            {isRegister ? "Create a new account to manage your finance" : "Sign in to access your dashboard"}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={tabContainerStyle}>
          <button
            type="button"
            onClick={() => toggleMode(false)}
            style={{
              ...tabStyle,
              background: !isRegister ? "#1D9E75" : "transparent",
              color: !isRegister ? "white" : "#666",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            style={{
              ...tabStyle,
              background: isRegister ? "#1D9E75" : "transparent",
              color: isRegister ? "white" : "#666",
            }}
          >
            Register
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alice Johnson"
                style={inputStyle}
                required
              />
            </div>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. alice@example.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8f9fa",
  padding: "1rem",
}

const cardStyle = {
  background: "white",
  borderRadius: "16px",
  border: "1px solid #ebebeb",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  padding: "2rem",
  width: "100%",
  maxWidth: "400px",
}

const tabContainerStyle = {
  display: "flex",
  background: "#f0f0f0",
  borderRadius: "10px",
  padding: "4px",
  marginBottom: "1.5rem",
}

const tabStyle = {
  flex: 1,
  padding: "8px 0",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
}

const fieldStyle = {
  marginBottom: "1rem",
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "#666",
  marginBottom: "6px",
  fontWeight: "500",
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
}

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#1D9E75",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "0.5rem",
}

const errorStyle = {
  background: "#FCE8E6",
  color: "#D85A30",
  padding: "10px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "1rem",
  border: "1px solid #F7C5C0",
}

export default AuthScreen
