const express = require("express");

import "dotenv/config";
import IndexRouter from "./Routes/index";

const app = express();
const cors = require("cors");

const PORT = process.env.PORT ?? 8085;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
app.use(cors());
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use("/api/v1", IndexRouter);
app.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  error.message = "Page Not Found";
  next(error);
});

//Error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: false,
    message: error.message,
  });
});
