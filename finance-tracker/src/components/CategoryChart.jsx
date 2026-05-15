import { useFinance } from "../context/FinanceContext"
import { formatCurrency, getCategoryColor } from "../utils/helpers"

function CategoryChart() {
  const { transactions } = useFinance()

  const expenses = transactions.filter((t) => t.type === "expense")
  const total = expenses.reduce((sum, t) => sum + t.amount, 0)

  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Spending by category</div>
      {sorted.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1rem 0" }}>
          No expenses this month
        </div>
      ) : (
        sorted.map(([category, amount]) => {
          const pct = total > 0 ? Math.round((amount / total) * 100) : 0
          return (
            <div key={category} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "#555" }}>{category}</span>
                <span style={{ fontSize: "12px", fontWeight: "500" }}>{formatCurrency(amount)}</span>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "8px" }}>
                <div style={{
                  width: `${pct}%`,
                  background: getCategoryColor(category),
                  height: "8px",
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  border: "1px solid #ebebeb",
  padding: "1rem 1.25rem",
}

const titleStyle = {
  fontSize: "14px",
  fontWeight: "500",
  marginBottom: "1rem",
  color: "#1a1a1a",
}

export default CategoryChart