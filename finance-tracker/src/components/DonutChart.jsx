import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFinance } from "../context/FinanceContext"
import { formatCurrency } from "../utils/helpers"

function DonutChart() {
  const { totalIncome, totalExpenses, balance } = useFinance()

  const data = [
    { name: "Expenses", value: totalExpenses },
    { name: "Savings", value: balance > 0 ? balance : 0 },
  ]

  const COLORS = ["#F0997B", "#1D9E75"]

  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Income vs Expenses</div>
      {totalIncome === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1rem 0" }}>
          No data this month
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <div style={{ fontSize: "11px", color: "#aaa" }}>savings rate</div>
            <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "6px", margin: "6px 0" }}>
              <div style={{
                width: `${Math.max(0, savingsRate)}%`,
                background: "#1D9E75",
                height: "6px",
                borderRadius: "4px",
              }} />
            </div>
            <div style={{ fontSize: "12px", color: "#1D9E75", fontWeight: "500" }}>
              {savingsRate}% of income saved
            </div>
          </div>
        </>
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
  marginBottom: "0.5rem",
  color: "#1a1a1a",
}

export default DonutChart