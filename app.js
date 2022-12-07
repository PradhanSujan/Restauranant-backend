const express  = require("express");
const cors = require("cors");
const morgan = require("morgan");
const expressValidator = require("express-validator");
require("dotenv").config()

const authRoute = require("./src/routes/authentication.route")

const app = express();

app.use(morgan("combined"));
app.use(express.json())
app.use(expressValidator());
app.use(cors());

// Routes
app.use("/v1/api",authRoute)


module.exports = app;