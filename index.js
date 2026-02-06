const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ======================
// MIDDLEWARES
// ======================
app.use(express.json());
app.use(cookieParser());

// ======================
// CORS CONFIG (FIXED)
// ======================
const allowedOrigins = [
  "http://localhost:5173",

  "https://moonlit-crumble-afead8.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ======================
// DATABASE CONNECTION
// ======================
require("./connection");

// ======================
// ROUTES
// ======================
const userRouter = require("./Router/user");
const fineRouter = require("./Router/fine");
const noticesRouter = require("./Router/notices");
const gallaryRouter = require("./Router/gallary");
const historyRouter = require("./Router/history");

app.use("/api/auth", userRouter);
app.use("/api/fine", fineRouter);
app.use("/api/notices", noticesRouter);
app.use("/api/gallary", gallaryRouter);
app.use("/api/history", historyRouter);

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
