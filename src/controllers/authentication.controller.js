const User = require("../models/authentication.model");
const Token = require("../models/token.model");
const crypto = require("crypto");

// Register User and Send email Confirmation link

exports.userRegistration = async (req, res) => {
  const { name, email, password } = req.body;
  const emailExist = await User.findOne({ email },null,{ strictQuery: true });
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
  //   let token = new Token({
  //     token: crypto.randomBytes(16).toString("hex"),
  //     userId:newUser._id
  //   })
  //   token = await token.save();
  //   if (!token) {
  //     return res.status(400).json({ error: "Something went wrong" });
  //   }
  res.send(newUser)
};
