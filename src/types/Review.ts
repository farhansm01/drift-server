import { ObjectId } from "mongodb";


/**
 * Drift — Review type definition (T07)
 *
 * Not tied to a booking (Drift has no booking system) — any logged-in
 * user can leave a review on a car's Details page. This is the shape
 * every document in the "reviews" MongoDB collection must follow.
 */

export interface Review {
  _id?: ObjectId;
  carId: string; // the Car's _id this review belongs to
  userId: string; // the user id (from BetterAuth) who wrote this review
  userName: string; // denormalized so we don't need a join to display it
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
}

/**
 * Shape of the data coming FROM a review submission form, before
 * userId / userId / createdAt are attached server-side.
 */
export type ReviewInput = Omit<Review, "_id" | "userId" | "userName" | "createdAt">;