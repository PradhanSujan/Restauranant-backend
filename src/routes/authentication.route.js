const express = require("express");
const router = express.Router();
const {
  userRegistration, postEmailConfirmation, userSignIn, userSignOut, requireSignIn,
} = require("../controllers/authentication.controller");
const { userRegistrationValidation } = require("../validation");

router.post("/register", userRegistrationValidation, userRegistration);
router.post("/confirmation/:token",postEmailConfirmation);

router.post("/signin",userSignIn);
router.post("/signout",requireSignIn,userSignOut);

module.exports = router;
