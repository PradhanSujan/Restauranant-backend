const express = require("express");
const router = express.Router();
const {
  userRegistration, postEmailConfirmation, userSignIn, userSignOut, requireSignIn, userForgetPassword, userResetPassword, userResendVerification,
} = require("../controllers/authentication.controller");
const { userRegistrationValidation, userResestPasswordValidation } = require("../validation");

router.post("/register", userRegistrationValidation, userRegistration);
router.post("/confirmation/:token",postEmailConfirmation);

router.post("/signin",userSignIn);

router.post("/forgetpassword",userForgetPassword);

router.put("/resetpassword/:token",userResestPasswordValidation,userResetPassword);
router.post("/resendverification",userResendVerification);
router.post("/signout",requireSignIn,userSignOut);

module.exports = router;
