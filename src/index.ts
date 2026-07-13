import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());

// Health check route — quick way to confirm the server is alive
app.get("/", (req, res) => {
  res.json({ message: "Drift server is running" });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Drift server running on port ${PORT}`);
  });
}

module.exports = app;