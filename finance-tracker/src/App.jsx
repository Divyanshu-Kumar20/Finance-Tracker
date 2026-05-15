import { useState } from "react"
import { FinanceProvider } from "./context/FinanceContext"
import TopBar from "./components/TopBar"
import SummaryCards from "./components/SummaryCards"
import CategoryChart from "./components/CategoryChart"
import DonutChart from "./components/DonutChart"
import TransactionList from "./components/TransactionList"
import AddTransactionModal from "./components/AddTransactionModal"
import "./index.css"

function AppContent() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
      <TopBar onAddClick={() => setShowModal(true)} />
      <SummaryCards />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <CategoryChart />
        <DonutChart />
      </div>
      <TransactionList />
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

export default App