const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ======================
// MIDDLEWARES
// ======================
app.set("trust proxy", 1); // Trusting the proxy is vital for secure cookies in production
app.use(express.json());
app.use(cookieParser());

// ======================
// CORS CONFIG
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://moonlit-crumble-afead8.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Better to log the origin for debugging
        console.error(`CORS Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH","DELETE"],
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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});