import mongoose from "mongoose";

export const ReactionSchema = new mongoose.Schema({
  likerIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
  dislikerIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
});
