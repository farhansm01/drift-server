import { ObjectId } from "mongodb";

export interface Review {
  _id?: ObjectId;
  type?: "car" | "platform";
  carId?: string;
  carTitle?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole?: string;
  rating: number;
  comment: string;
  approved?: boolean;
  createdAt: Date;
}

export type ReviewInput = Omit<Review, "_id" | "createdAt">;
