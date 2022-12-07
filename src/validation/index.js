exports.userRegistrationValidation = (req, res, next) => {
  req
    .check("name", "Please provide name")
    .notEmpty()
    .isLength({
      min: 3,
    })
    .withMessage("Name must be three characters")
    .matches(/^[A-Z a-z]+$/)
    .withMessage("Name must contain only alphabets");

  req
    .check("email", "Please provide email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide valid email");

  req
    .check("password", "Please provide password")
    .notEmpty()
    .isLength({
      min: 8,
      max: 16,
    })
    .withMessage(
      "Password must be atleast 8 characters long and upto 16 character"
    );

  const errors = req.validationErrors();
  if (errors) {
    const [showError] = errors.map((err) => err.msg);
    return res.status(400).json({
      error: showError,
    });
  }
  next();
};
