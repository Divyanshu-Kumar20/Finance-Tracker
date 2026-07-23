import { useState } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { FinanceProvider } from "./context/FinanceContext"
import AuthScreen from "./components/AuthScreen"
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

function MainLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", color: "#666", fontSize: "14px" }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

export default App