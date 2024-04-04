import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    min: 1,
  },
  // Temporary property
  password: {
    type: String,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    default: "Never gonna give you up.",
  },
  // Will implement default image later
  picture: {
    type: String,
    default: "https://github.com/shadcn.png",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  refreshToken: String,
});

export const User = mongoose.model("User", UserSchema);
