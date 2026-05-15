import { createContext, useContext, useReducer, useEffect } from "react"
import useLocalStorage from "../hooks/useLocalStorage"

const FinanceContext = createContext()

const initialState = {
  transactions: [
    { id: 1, name: "Salary", amount: 45000, type: "income", category: "Employment", date: "2026-05-01" },
    { id: 2, name: "Rent payment", amount: 12000, type: "expense", category: "Rent", date: "2026-05-03" },
    { id: 3, name: "Petrol", amount: 1200, type: "expense", category: "Transport", date: "2026-05-05" },
    { id: 4, name: "Freelance project", amount: 7000, type: "income", category: "Side Income", date: "2026-05-08" },
    { id: 5, name: "Myntra order", amount: 2800, type: "expense", category: "Shopping", date: "2026-05-11" },
    { id: 6, name: "Groceries", amount: 3500, type: "expense", category: "Food", date: "2026-05-12" },
  ],
  filter: "all",
  selectedMonth: "2026-05",
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] }
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) }
    case "SET_FILTER":
      return { ...state, filter: action.payload }
    case "SET_MONTH":
      return { ...state, selectedMonth: action.payload }
    default:
      return state
  }
}

export function FinanceProvider({ children }) {
  const [savedTransactions, setSavedTransactions] = useLocalStorage("transactions", initialState.transactions)
  const [state, dispatch] = useReducer(reducer, { ...initialState, transactions: savedTransactions })

  useEffect(() => {
    setSavedTransactions(state.transactions)
  }, [state.transactions])

  const monthlyTransactions = state.transactions.filter((t) =>
    t.date.startsWith(state.selectedMonth)
  )

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const addTransaction = (transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: { ...transaction, id: Date.now() } })
  }

  const deleteTransaction = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id })
  }

  const setFilter = (filter) => {
    dispatch({ type: "SET_FILTER", payload: filter })
  }

  const setMonth = (month) => {
    dispatch({ type: "SET_MONTH", payload: month })
  }

  return (
    <FinanceContext.Provider value={{
      transactions: monthlyTransactions,
      filter: state.filter,
      selectedMonth: state.selectedMonth,
      totalIncome,
      totalExpenses,
      balance,
      addTransaction,
      deleteTransaction,
      setFilter,
      setMonth,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  return useContext(FinanceContext)
}