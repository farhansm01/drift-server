import { Router, Request, Response } from "express";
import { getDb } from "../db";
import type { Car } from "../types/Car";
import { ObjectId } from "mongodb";

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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const db = await getDb();
    

    const car = await db.collection("cars").findOne({ _id: new ObjectId(id) });

    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }

    if (car.createdBy !== userId) {
      return res.status(403).json({ error: "You can only delete your own listings." });
    }

    await db.collection("cars").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete car error:", err);
    res.status(500).json({ error: "Failed to delete car." });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid car id." });
  }

  try {
    const db = await getDb();
    const car = await db.collection<Car>("cars").findOne({ _id: new ObjectId(id) });

    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }

    return res.status(200).json(car);
  } catch (err) {
    console.error("Error fetching car by id:", err);
    return res.status(500).json({ error: "Failed to fetch car." });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { userId } = req.query;

    const query: Partial<Pick<Car, "createdBy">> = {};
    if (userId && typeof userId === "string") {
      query.createdBy = userId;
    }

    const cars = await db
      .collection<Car>("cars")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(cars);
  } catch (err) {
    console.error("Error fetching cars:", err);
    return res.status(500).json({ error: "Failed to fetch cars." });
  }
});


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