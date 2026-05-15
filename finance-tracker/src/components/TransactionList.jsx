import { useFinance } from "../context/FinanceContext"
import { formatCurrency, formatDate, getCategoryIcon } from "../utils/helpers"

function TransactionList() {
  const { transactions, filter, setFilter, deleteTransaction } = useFinance()

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true
    return t.type === filter
  })

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={titleStyle}>Recent transactions</div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "income", "expense"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: filter === f ? "#1D9E75" : "#e0e0e0",
                background: filter === f ? "#1D9E75" : "white",
                color: filter === f ? "white" : "#888",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", padding: "1.5rem 0" }}>
          No transactions found
        </div>
      ) : (
        filtered.map((t) => (
          <div key={t.id} style={rowStyle}>
            <div style={iconStyle}>{getCategoryIcon(t.category)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#1a1a1a" }}>{t.name}</div>
              <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                {t.category} · {formatDate(t.date)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: "13px",
                fontWeight: "600",
                color: t.type === "income" ? "#1D9E75" : "#D85A30",
              }}>
                {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
              </div>
              <button
                onClick={() => deleteTransaction(t.id)}
                style={{
                  fontSize: "10px",
                  color: "#ccc",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "2px",
                }}
              >
                delete
              </button>
            </div>
          </div>
        ))
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
  color: "#1a1a1a",
}

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 0",
  borderBottom: "1px solid #f5f5f5",
}

const iconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  background: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  flexShrink: 0,
}

export default TransactionList