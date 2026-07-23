import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../utils/api"
import { useAuth } from "./AuthContext"

const FinanceContext = createContext()

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export function FinanceProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    byCategory: [],
  })
  const [filter, setFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (month) => {
    if (!isAuthenticated) return

    setLoading(true)
    setError(null)

    try {
      const [txRes, sumRes] = await Promise.all([
        api.get(`/api/transactions?month=${month}`),
        api.get(`/api/transactions/summary?month=${month}`),
      ])

      setTransactions(txRes.data.transactions || [])
      setSummary(sumRes.data || { totalIncome: 0, totalExpenses: 0, balance: 0, byCategory: [] })
    } catch (err) {
      console.error("Failed to fetch finance data:", err)
      const msg = err.response?.data?.message || "Failed to load transactions. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchData(selectedMonth)
  }, [selectedMonth, fetchData])

  const addTransaction = async (transactionData) => {
    setLoading(true)
    setError(null)

    try {
      await api.post("/api/transactions", transactionData)
      await fetchData(selectedMonth)
      return { success: true }
    } catch (err) {
      console.error("Failed to add transaction:", err)
      let msg = "Failed to add transaction."
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.map((e) => e.message).join(". ")
      } else if (err.response?.data?.message) {
        msg = err.response.data.message
      }
      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  const deleteTransaction = async (id) => {
    setLoading(true)
    setError(null)

    try {
      await api.delete(`/api/transactions/${id}`)
      await fetchData(selectedMonth)
      return { success: true }
    } catch (err) {
      console.error("Failed to delete transaction:", err)
      const msg = err.response?.data?.message || "Failed to delete transaction."
      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  const setMonth = (month) => {
    setSelectedMonth(month)
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        balance: summary.balance,
        byCategory: summary.byCategory,
        filter,
        selectedMonth,
        loading,
        error,
        addTransaction,
        deleteTransaction,
        setFilter,
        setMonth,
        refetch: () => fetchData(selectedMonth),
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}