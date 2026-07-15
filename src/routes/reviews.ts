import { Router, Request, Response } from "express";
import { getDb } from "../db";
import type { Review } from "../types/Review";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { carId, userId, userName, rating, comment } = req.body;

  if (!carId || !userId || !userName || !rating || !comment) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const db = await getDb();

    const newReview: Omit<Review, "_id"> = {
      carId,
      userId,
      userName,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    const result = await db.collection<Omit<Review, "_id">>("reviews").insertOne(newReview);

    return res.status(201).json({ ...newReview, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ error: "Failed to submit review." });
  }
});

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