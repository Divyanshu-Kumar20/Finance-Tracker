import { useReducer, useState } from "react"
import { useFinance } from "../context/FinanceContext"
import { categorizeExpense } from "../utils/api"

const CATEGORIES = {
  income: ["Employment", "Side Income", "Other"],
  expense: ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Other"],
}

const initialState = (selectedMonth) => ({
  name: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: selectedMonth + "-01",
  aiSuggested: false,
  aiCategorized: false,
  aiConfidence: 0,
  categorizing: false,
})

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD": {
      const { name, value } = action.payload
      const isTypeChange = name === "type"
      const newType = isTypeChange ? value : state.type
      const newCategory = isTypeChange ? CATEGORIES[value][0] : (name === "category" ? value : state.category)

      return {
        ...state,
        [name]: value,
        type: newType,
        category: newCategory,
        ...(name === "category" ? { aiSuggested: false } : {}),
      }
    }
    case "START_CATEGORIZING":
      return { ...state, categorizing: true }
    case "CATEGORIZE_SUCCESS": {
      const { category, aiConfidence, aiCategorized } = action.payload
      const validCategories = CATEGORIES[state.type]
      const finalCategory = validCategories.includes(category) ? category : "Other"

      return {
        ...state,
        categorizing: false,
        category: finalCategory,
        aiSuggested: Boolean(aiCategorized && finalCategory !== "Other"),
        aiCategorized: Boolean(aiCategorized),
        aiConfidence: typeof aiConfidence === "number" ? aiConfidence : 0,
      }
    }
    case "CATEGORIZE_ERROR":
      return { ...state, categorizing: false }
    default:
      return state
  }
}

function AddTransactionModal({ onClose }) {
  const { addTransaction, selectedMonth } = useFinance()
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [state, dispatch] = useReducer(formReducer, selectedMonth, initialState)

  const handleChange = (e) => {
    const { name, value } = e.target
    dispatch({ type: "SET_FIELD", payload: { name, value } })
  }

  const handleNameBlur = async () => {
    if (!state.name.trim() || state.type !== "expense") return

    dispatch({ type: "START_CATEGORIZING" })
    try {
      const res = await categorizeExpense(state.name)
      dispatch({ type: "CATEGORIZE_SUCCESS", payload: res })
    } catch (err) {
      dispatch({ type: "CATEGORIZE_ERROR" })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError(null)

    if (!state.name.trim()) {
      setModalError("Name is required")
      return
    }

    if (!state.amount || isNaN(state.amount) || Number(state.amount) <= 0) {
      setModalError("Amount must be a number greater than 0")
      return
    }

    setSubmitting(true)
    const result = await addTransaction({
      name: state.name,
      amount: Number(state.amount),
      type: state.type,
      category: state.category,
      date: state.date,
      ...(state.aiCategorized ? { aiCategorized: state.aiCategorized, aiConfidence: state.aiConfidence } : {}),
    })
    setSubmitting(false)

    if (result && result.success) {
      onClose()
    } else if (result && result.error) {
      setModalError(result.error)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Add transaction</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888" }}>×</button>
        </div>

        {modalError && (
          <div style={{ background: "#FCE8E6", color: "#D85A30", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "1rem" }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["income", "expense"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => dispatch({ type: "SET_FIELD", payload: { name: "type", value: t } })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: state.type === t ? (t === "income" ? "#1D9E75" : "#D85A30") : "#e0e0e0",
                    background: state.type === t ? (t === "income" ? "#E1F5EE" : "#FAECE7") : "white",
                    color: state.type === t ? (t === "income" ? "#1D9E75" : "#D85A30") : "#888",
                    fontWeight: "500",
                    fontSize: "13px",
                    textTransform: "capitalize",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Name</label>
            <input
              name="name"
              value={state.name}
              onChange={handleChange}
              onBlur={handleNameBlur}
              placeholder="e.g. Salary, Zomato order"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Amount (₹)</label>
            <input
              name="amount"
              value={state.amount}
              onChange={handleChange}
              placeholder="e.g. 5000"
              type="number"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Category</label>
              {state.categorizing && (
                <span style={{ fontSize: "11px", color: "#1D9E75", fontStyle: "italic" }}>
                  Categorizing...
                </span>
              )}
            </div>
            <select name="category" value={state.category} onChange={handleChange} style={inputStyle}>
              {CATEGORIES[state.type].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {state.aiSuggested && !state.categorizing && (
              <div style={badgeStyle}>
                ✨ Suggested by on-device AI
              </div>
            )}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Date</label>
            <input
              name="date"
              value={state.date}
              onChange={handleChange}
              type="date"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={submitting} style={submitStyle}>
            {submitting ? "Adding..." : "Add transaction"}
          </button>
        </form>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
}

const modalStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "1.5rem",
  width: "100%",
  maxWidth: "400px",
  margin: "0 1rem",
}

const fieldStyle = { marginBottom: "1rem" }

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "#888",
  marginBottom: "6px",
}

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
}

const badgeStyle = {
  marginTop: "6px",
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "500",
  color: "#1D9E75",
  background: "#E1F5EE",
  padding: "3px 8px",
  borderRadius: "12px",
  border: "1px solid #B8E6D5",
}

const submitStyle = {
  width: "100%",
  padding: "10px",
  background: "#1D9E75",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  marginTop: "0.5rem",
}

export default AddTransactionModal