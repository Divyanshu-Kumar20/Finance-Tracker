import { useFinance } from "../context/FinanceContext"
import { formatCurrency } from "../utils/helpers"

function SummaryCards() {
  const { balance, totalIncome, totalExpenses } = useFinance()
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
      <div style={cardStyle}>
        <div style={labelStyle}>⚖️ Balance</div>
        <div style={{ ...valueStyle, color: balance >= 0 ? "#1D9E75" : "#D85A30" }}>
          {formatCurrency(balance)}
        </div>
        <div style={subStyle}>{savingsRate}% savings rate</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>📈 Income</div>
        <div style={{ ...valueStyle, color: "#1D9E75" }}>{formatCurrency(totalIncome)}</div>
        <div style={subStyle}>this month</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>📉 Expenses</div>
        <div style={{ ...valueStyle, color: "#D85A30" }}>{formatCurrency(totalExpenses)}</div>
        <div style={subStyle}>this month</div>
      </div>
    </div>
  )
}

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #ebebeb",
  padding: "1rem 1.25rem",
}

const labelStyle = {
  fontSize: "12px",
  color: "#888",
  marginBottom: "6px",
}

const valueStyle = {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "4px",
}

const subStyle = {
  fontSize: "11px",
  color: "#aaa",
}

export default SummaryCards