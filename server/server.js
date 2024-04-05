import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser";
import { revalidateRefreshToken } from "../middleware/auth.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import commentRouter from "./routes/comment.js";
import accountRouter from "./routes/account.js";

dotenv.config();

const app = express();
const port = 3000;
const apiRouter = express.Router();

mongoose.connect("mongodb://127.0.0.1:27017/T3Db");

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(revalidateRefreshToken);
app.use("/images", express.static("server/images"));

// Routes
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/account", accountRouter);

//Api route
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
