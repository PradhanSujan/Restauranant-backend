const User = require("../models/authentication.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const sendEmail = require("../utils/setEmail");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

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

exports.postEmailConfirmation = (req, res) => {
  try {
    // Find the valid and matching token
    Token.findOne(
      {
        token: req.params.token,
      },
      (error, token) => {
        if (error || !token) {
          return res.status(400).json({
            error: "Invalid Token or Token may have been expired",
          });
        }
        // if token found then find the valid user for the token
        User.findOne({ _id: token.userId }, (error, user) => {
          if (error || !user) {
            return res.status(400).json({
              error: "Unable to find the valid user for this token",
            });
          }
          // check whether the user is verified or not
          if (user.isVerified) {
            return res.status(400).json({
              error: `${user.name}, Email: ${user.email} has already been verified, Login to continue`,
            });
          }
          // save the verified user
          user.isVerified = true;
          user.save((error) => {
            if (error) {
              return res.status(400).json({
                error,
              });
            }
            res.json({
              message: `Congrats!!! ${user.name}, Your email is verified successfully🎉`,
            });
          });
        });
      }
    );
  } catch (error) {
    console.log(`Error ${error}`);
  }
};

exports.userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check email is registered or not
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: `Email is not registered,First register the email` });
    }
    // email foiund then check the password
    if (!user.authenticate(password)) {
      return res
        .status(400)
        .json({ error: "Email or password does not match💥💥" });
    }
    //check whether the user is verified or not
    if (!user.isVerified) {
      return res.status(400).json({
        error: "User not verified, Please verify the email",
      });
    }

    // generate token using userId and JWT_SECRET
    const signInToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // store in cookie
    res.cookie("ourCookie", signInToken, { expire: Date.now() + 999999 });

    //to send user information in front end
    const { _id, role, name } = user;

    return res.json({
      signInToken,
      user: {
        name,
        email,
        _id,
        role,
      },
    });
  } catch (err) {
    console.log("Error", err);
  }
};

exports.userSignOut = (req, res) => {
  try {
    res.clearCookie("ourCookie");
    res.json({
      message: "Signed out Succesfully",
    });
  } catch (err) {
    console.log(err);
  }
};

// forget password
exports.userForgetPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ error: "Email not registered" });
  }
  let token = new Token({
    token: crypto.randomBytes(16).toString("hex"),
    userId: user._id,
  });
  token = await token.save();
  if (!token) {
    return res.status(400).json({ error: "Something went wrong" });
  }
  sendEmail({
    from: "no-reply@restro.com",
    to: user.email,
    subject: "Password Reset Link",
    text: `Hello, \n \n Please reset your password by copying the below link :\n\n 
  http:\/\/${req.headers.host}\/api\/resetpassword\/${token.token}`,
  });
  res.json({ message: "Password reset link has been sent to your email" });
};

// reset password
exports.userResetPassword = async (req, res) => {
  // first find the valid or matching token
  let token = await Token.findOne({
    token: req.params.token,
  });
  if (!token) {
    return res.status(400).json({
      error: "Invalid token or may have been expired",
    });
  }
  // find valid user
  let user = await User.findOne({
    email: req.body.email,
    _id: token.userId,
  });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Unable to find a valid user for this token" });
  }
  user.password = req.body.password;
  user = await user.save();
  if (!user) {
    return res.status(400).json({ error: "Failed to reset password" });
  }
  res.json({ message: "Password has been reset successfully" });
};

// resend veriofication link
exports.userResendVerification = async (req, res) => {
  // first find the registered user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Sorry the email you provided is not in our system" });
  }
  if (user.isVerified) {
    return res
      .status(400)
      .json({ error: "Email has already been verified, Login to continue" });
  }

  //create token to store in database and send to email as params
  let token = new Token({
    token: crypto.randomBytes(16).toString("hex"),
    userId: user._id,
  });
  token = await token.save();
  if (!token) {
    return res.status(400).json({ error: "Something went wrong" });
  }
  //send email
  sendEmail({
    from: "no-reply@ecommerce.com",
    to: user.email,
    subject: "Email Verification Link",
    text: `Hello, \n \n Please confirm your email by copying the below link :\n\n 
  http:\/\/${req.headers.host}\/api\/confirmation\/${token.token}`,
  });
  res.json({
    message: "Account verification link has been sent to your email",
  });
};

// For authorization
exports.requireSignIn = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});
