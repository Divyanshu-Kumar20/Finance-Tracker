const express = require("express");
const {
  listTransactions,
  getTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  categorizeTransaction,
} = require("../controllers/transactionController");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { transactionValidator } = require("../validators/transactionValidators");

const router = express.Router();

router.use(auth);

router.post("/categorize", asyncHandler(categorizeTransaction));
router.get("/summary", asyncHandler(getTransactionSummary));
router.get("/", asyncHandler(listTransactions));
router.post("/", transactionValidator, validate, asyncHandler(createTransaction));
router.put("/:id", transactionValidator, validate, asyncHandler(updateTransaction));
router.delete("/:id", asyncHandler(deleteTransaction));

module.exports = router;
