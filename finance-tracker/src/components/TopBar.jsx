import { useFinance } from "../context/FinanceContext"

function TopBar({ onAddClick }) {
  const { selectedMonth, setMonth } = useFinance()

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const prev = new Date(year, month - 2)
    setMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`)
  }

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const next = new Date(year, month)
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`)
  }

  const displayMonth = new Date(selectedMonth + "-01").toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    }}>
      <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a" }}>
        💰 Finance Tracker
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button onClick={handlePrevMonth} style={navBtnStyle}>‹</button>
        <span style={{ fontSize: "14px", fontWeight: "500", minWidth: "120px", textAlign: "center" }}>
          {displayMonth}
        </span>
        <button onClick={handleNextMonth} style={navBtnStyle}>›</button>
        <button onClick={onAddClick} style={addBtnStyle}>+ Add</button>
      </div>
    </div>
  )
}

const navBtnStyle = {
  background: "white",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "6px 10px",
  fontSize: "16px",
  cursor: "pointer",
}

const addBtnStyle = {
  background: "#1D9E75",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
}

export default TopBar