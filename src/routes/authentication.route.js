const express = require("express");
const router = express.Router();
const {
  userRegistration,
} = require("../controllers/authentication.controller");
const { userRegistrationValidation } = require("../validation");

router.post("/register", userRegistrationValidation, userRegistration);

module.exports = router;
