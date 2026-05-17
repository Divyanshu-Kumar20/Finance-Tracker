# Personal Finance Tracker

A fully functional personal finance tracking web app built with React.js. Track your income and expenses, visualize spending patterns, and manage your monthly budget — all in the browser with no backend required.

## Live Demo

[View Live Site](https://finance-tracker-rosy-nu.vercel.app/)



## Features

- Track income and expenses in real time
- Visual spending breakdown by category with bar charts
- Donut chart showing income vs savings ratio
- Add and delete transactions with a clean modal
- Filter transactions by All, Income, or Expense
- Month by month navigation to view history
- Data persists using localStorage — no backend needed
- Fully responsive design

## Tech Stack

- React.js
- Vite
- Recharts
- localStorage API
- GitHub Pages (deployment)

## React Concepts Used

- useState — managing component level state
- useEffect — syncing data with localStorage
- useReducer — handling complex state logic for transactions
- useContext — global state management without prop drilling
- Custom hooks — useLocalStorage for reusable persistence logic

## Project Structure

```
src/
├── components/
│   ├── TopBar.jsx
│   ├── SummaryCards.jsx
│   ├── CategoryChart.jsx
│   ├── DonutChart.jsx
│   ├── TransactionList.jsx
│   └── AddTransactionModal.jsx
├── context/
│   └── FinanceContext.jsx
├── hooks/
│   └── useLocalStorage.js
├── utils/
│   └── helpers.js
├── App.jsx
└── index.css
```

