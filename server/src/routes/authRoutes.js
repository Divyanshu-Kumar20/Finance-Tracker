const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerValidator, loginValidator } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validate, asyncHandler(register));
router.post("/login", loginValidator, validate, asyncHandler(login));
router.get("/me", auth, asyncHandler(getMe));

module.exports = router;
