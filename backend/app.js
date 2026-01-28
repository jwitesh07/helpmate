const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const AppError = require("./utils/appError.js");
const db = require("./database/db.js");

const useradminRouter = require("./routers/user_adminRouter.js");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app;
app.use("/api/v1/user", useradminRouter);


// Health check
app.get("/health", (req, res) => {
  res.status(200).send("API server up");
});

// Global error handler (uncomment when implemented)
// app.use(globalErrorHandler);

module.exports = app;
