import mongoose from "mongoose";
import { ReactionSchema } from "./shared/reaction.js";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 1,
    required: true,
    trim: true,
  },
  posterId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  body: {
    type: String,
    min: 1,
    required: true,
    trim: true,
  },
  uploadDate: {
    type: Date,
    default: () => Date.now(),
  },
  reactions: ReactionSchema,
  tags: [String],
});

export const Post = mongoose.model("Post", PostSchema);
