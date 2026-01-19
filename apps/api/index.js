const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

console.log("Starting backend...");

try {
  dotenv.config();
  console.log("Dotenv config loaded");

  const app = express();
  const PORT = process.env.PORT || 5000;

  console.log(`Port set to ${PORT}`);

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Backend is running!");
  });

  app.listen(PORT, (err) => {
    if (err) {
      console.error("Error starting server:", err);
    } else {
      console.log(`Server is running on http://localhost:${PORT}`);
    }
  });
} catch (error) {
  console.error("Fatal error:", error);
}
