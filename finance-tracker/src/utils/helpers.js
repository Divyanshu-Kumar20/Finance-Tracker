export function formatCurrency(amount) {
  return "₹" + amount.toLocaleString("en-IN")
}

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function getCategoryIcon(category) {
  const icons = {
    Employment: "💼",
    "Side Income": "💻",
    Rent: "🏠",
    Food: "🍽️",
    Transport: "🛵",
    Shopping: "🛍️",
    Entertainment: "🎬",
    Health: "💊",
    Education: "📚",
    Other: "📦",
  }
  return icons[category] || "📦"
}

export function getCategoryColor(category) {
  const colors = {
    Employment: "#1D9E75",
    "Side Income": "#1D9E75",
    Rent: "#EF9F27",
    Food: "#EF9F27",
    Transport: "#7F77DD",
    Shopping: "#D4537E",
    Entertainment: "#D85A30",
    Health: "#378ADD",
    Education: "#639922",
    Other: "#888780",
  }
  return colors[category] || "#888780"
}