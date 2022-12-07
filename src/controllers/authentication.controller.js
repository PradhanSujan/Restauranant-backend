const User = require("../models/authentication.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const sendEmail = require("../utils/setEmail");

// Register User and Send email Confirmation link

exports.userRegistration = async (req, res) => {
  const { name, email, password } = req.body;
  const emailExist = await User.findOne({ email }, null, { strictQuery: true });
  if (emailExist) {
    return res.status(400).json({ error: "Email already exists" });
  }
  let newUser = new User({
    name,
    email,
    password,
  });
  newUser = await newUser.save();
  if (!newUser) {
    return res.status(400).json({
      error: error,
      message: "Something went wrong",
    });
  }
  let tokenGen = new Token({
    token: crypto.randomBytes(16).toString("hex"),
    userId: newUser._id,
  });
  tokenGen = await tokenGen.save();
  if (!tokenGen) {
    return res.status(400).json({ error: "Something went wrong" });
  }

  sendEmail({
    from: "no-reply@restro.com",
    to: newUser.email,
    subject: "Email Verification Link",
    text: `Hello, \n \n Please confirm your email by copying the below link :\n\n 
    http:\/\/${req.headers.host}\/v1\/api\/confirmation\/${tokenGen.token}`,
  });
  res.send(newUser);
};
