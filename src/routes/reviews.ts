import { Router, Request, Response } from "express";
import { getDb } from "../db";
import type { Review } from "../types/Review";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { type = "car", carId, carTitle, userId, userName, userAvatar, userRole, rating, comment, approved } = req.body;

  if (!userId || !userName || !rating || !comment) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (type === "car" && !carId) {
    return res.status(400).json({ error: "carId is required for car reviews." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const db = await getDb();

    const isPlatform = type === "platform";

    const newReview: Omit<Review, "_id"> = {
      type: isPlatform ? "platform" : "car",
      carId: carId ? String(carId) : undefined,
      carTitle: carTitle ? String(carTitle) : undefined,
      userId: String(userId),
      userName: String(userName),
      userAvatar: userAvatar ? String(userAvatar) : undefined,
      userRole: userRole ? String(userRole) : isPlatform ? "Platform User" : "Verified Buyer",
      rating: Number(rating),
      comment: String(comment),
      approved: approved !== undefined ? Boolean(approved) : isPlatform ? false : true,
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
    const { type, carId, approved } = req.query;

    const filter: any = {};

    if (carId && typeof carId === "string") {
      filter.carId = carId;
    } else if (type === "platform" || !carId) {
      filter.type = "platform";
      if (approved !== "false") {
        filter.approved = true;
      }
    }

    const reviews = await db
      .collection<Review>("reviews")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

export default router;
