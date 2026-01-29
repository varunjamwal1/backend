const express = require("express");
const app = express();
require("dotenv").config({ path: './.env' });
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Middlewares
app.use(express.json());       // <-- This allows JSON data
app.use(cookieParser());

app.use(cors({
  credentials:true,
  origin:["http://localhost:5173"]
}))
// Database Connection
require("./connection");

// Routes
const userRouter = require("./Router/user");
const fineRouter = require("./Router/fine");
const noticesRouter = require("./Router/notices");
const gallaryRouter = require("./Router/gallary");
const historyRouter = require("./Router/history");

;
app.use("/api/auth", userRouter);
app.use("/api/fine", fineRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/gallary", gallaryRouter);
app.use("/api/history", historyRouter);
// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
