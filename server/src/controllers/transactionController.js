const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const buildTransactionPayload = (body) => {
  const { name, amount, type, category, date } = body;

  return {
    name,
    amount,
    type,
    category,
    date,
  };
};

const listTransactions = async (req, res) => {
  try {
    const { month } = req.query;
    const query = { user: req.user._id };

    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: "Month must use YYYY-MM format" });
      }

      query.date = { $regex: `^${month}` };
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }

    const [summary] = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $regex: `^${month}` },
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category",
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          category: "$_id.category",
          amount: 1,
        },
      },
      {
        $sort: {
          type: 1,
          amount: -1,
          category: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          categoryGroups: {
            $push: {
              type: "$type",
              category: "$category",
              amount: "$amount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          balance: { $subtract: ["$totalIncome", "$totalExpenses"] },
          byCategory: {
            $map: {
              input: {
                $filter: {
                  input: "$categoryGroups",
                  as: "group",
                  cond: { $eq: ["$$group.type", "expense"] },
                },
              },
              as: "group",
              in: {
                category: "$$group.category",
                amount: "$$group.amount",
              },
            },
          },
        },
      },
    ]);

    res.json(
      summary || {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        byCategory: [],
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction summary" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...buildTransactionPayload(req.body),
      amount: Number(req.body.amount),
      user: req.user._id,
    });

    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...buildTransactionPayload(req.body),
        amount: Number(req.body.amount),
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

module.exports = {
  listTransactions,
  getTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
