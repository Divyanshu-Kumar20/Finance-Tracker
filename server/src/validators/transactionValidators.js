const { body } = require("express-validator");
const Transaction = require("../models/Transaction");

const allowedTypes = ["income", "expense"];
const allowedCategories = Transaction.categories;

const transactionValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 120 })
    .withMessage("Name must be 120 characters or fewer"),
  body("amount")
    .exists({ values: "null" })
    .withMessage("Amount is required")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than 0")
    .toFloat(),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isIn(allowedTypes)
    .withMessage("Type must be either income or expense"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(", ")}`),
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must use YYYY-MM-DD format"),
];

module.exports = {
  transactionValidator,
};
