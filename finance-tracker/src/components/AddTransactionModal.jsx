import { useState } from "react"
import { useFinance } from "../context/FinanceContext"

const CATEGORIES = {
  income: ["Employment", "Side Income", "Other"],
  expense: ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Other"],
}

function AddTransactionModal({ onClose }) {
  const { addTransaction, selectedMonth } = useFinance()
  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: selectedMonth + "-01",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" ? { category: CATEGORIES[value][0] } : {}),
    }))
  }

  const handleSubmit = () => {
    if (!form.name || !form.amount || isNaN(form.amount)) return
    addTransaction({ ...form, amount: Number(form.amount) })
    onClose()
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Add transaction</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888" }}>×</button>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["income", "expense"].map((t) => (
              <button
                key={t}
                onClick={() => setForm((p) => ({ ...p, type: t, category: CATEGORIES[t][0] }))}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: form.type === t ? (t === "income" ? "#1D9E75" : "#D85A30") : "#e0e0e0",
                  background: form.type === t ? (t === "income" ? "#E1F5EE" : "#FAECE7") : "white",
                  color: form.type === t ? (t === "income" ? "#1D9E75" : "#D85A30") : "#888",
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
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Salary, Zomato order"
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Amount (₹)</label>
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 5000"
            type="number"
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
            {CATEGORIES[form.type].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Date</label>
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            style={inputStyle}
          />
        </div>

        <button onClick={handleSubmit} style={submitStyle}>
          Add transaction
        </button>
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