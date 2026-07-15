import { Router, Request, Response } from "express";
import { getDb } from "../db";
import type { Review } from "../types/Review";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { carId } = req.query;

    if (!carId || typeof carId !== "string") {
      return res.status(400).json({ error: "carId query parameter is required." });
    }

    const reviews = await db
      .collection<Review>("reviews")
      .find({ carId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

export default router;