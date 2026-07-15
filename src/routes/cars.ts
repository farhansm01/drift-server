import { Router, Request, Response } from "express";
import { getDb } from "../db";
import type { Car } from "../types/Car";

const router = Router();

interface CreateCarRequestBody {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: number;
  category?: string;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
  image?: string;
  contactInfo?: string;
  userId?: string;
}

const REQUIRED_FIELDS: (keyof CreateCarRequestBody)[] = [
  "title",
  "shortDescription",
  "fullDescription",
  "price",
  "category",
  "seats",
  "transmission",
  "fuelType",
  "location",
  "contactInfo",
  "userId",
];

router.post("/", async (req: Request, res: Response) => {
  const body: CreateCarRequestBody = req.body;

  const missingFields = REQUIRED_FIELDS.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required field(s): ${missingFields.join(", ")}`,
    });
  }

  try {
    const db = await getDb();

    const newCar: Omit<Car, "_id"> = {
      title: body.title as string,
      shortDescription: body.shortDescription as string,
      fullDescription: body.fullDescription as string,
      price: Number(body.price),
      category: body.category as Car["category"],
      seats: Number(body.seats),
      transmission: body.transmission as Car["transmission"],
      fuelType: body.fuelType as Car["fuelType"],
      location: body.location as string,
      image: body.image || "",
      contactInfo: body.contactInfo as string,
      createdBy: body.userId as string,
      createdAt: new Date(),
    };

    const result = await db.collection<Omit<Car, "_id">>("cars").insertOne(newCar);

    return res.status(201).json({
      ...newCar,
      _id: result.insertedId,
    });
  } catch (err) {
    console.error("Error creating car:", err);
    return res.status(500).json({ error: "Failed to create car listing." });
  }
});

export default router;