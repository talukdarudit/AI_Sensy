import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
