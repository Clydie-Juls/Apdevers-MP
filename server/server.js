import process from 'process';

import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import bcrypt from "bcrypt";
import { check, validationResult } from "express-validator";

import { User } from "../models/user.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import {
  jwtAuth,
  createJwtAccessToken,
  createJwtRefreshToken,
  jwtPartialAuth,
} from "../middleware/auth.js";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = 3000;
const apiRouter = express.Router();

mongoose.connect(`mongodb+srv://lenzgiorivera:${process.env.DB_PASSWORD}@ccapdev.sv0smzh.mongodb.net/?retryWrites=true&w=majority&appName=CCAPDEV`);

const POST_LIMIT = 15;

const passwordMatches = async (password, hash) => {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Error comparing passwords", hash);
  }
};

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

function sendRefreshToken(res, refreshToken, keepLoggedIn = false) {
  if (keepLoggedIn) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // maxAge: 14 * 24 * 60 * 60 * 1000, // milliseconds to 14 days(2 weeks)
      // expires: new Date(Date.now() + 60000), // for testing
      expires: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      secure: true,
    });
  } else {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
  }
}

app.use(async (req, res, next) => {
  if (req.cookies.refreshToken && req.cookies.refreshToken.expires) {
    const user = await User.findOne({
      refreshToken: req.cookies.refreshToken,
    });

    const refreshToken = createJwtRefreshToken({ username: user.username });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      secure: true,
    });

    await User.updateOne(
      {
        refreshToken: req.cookies.refreshToken,
      },
      {
        refreshToken,
      }
    );
  }

  next();
});

// Images

const upload = multer({ dest: "server/images/" });
app.use("/images", express.static("server/images"));

apiRouter.post(
  "/users/picture/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const pictureLink = `http://localhost:3000/images/${req.file.filename}`;

      const { nModified } = await User.updateOne(
        {
          _id: req.params.id,
        },
        {
          picture: pictureLink,
        }
      );

      if (nModified === 0) {
        res.status(204);
      } else {
        res.status(200).send(pictureLink);
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// GET HTTP requests
apiRouter.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The user does not exist." });
      return;
    }

    const user = await User.findById(id).lean();
    const posts = await Post.find({ posterId: id }).lean();
    let comments = await Comment.find({ commenterId: id }).lean();

    // add post object to each comment
    comments = await Promise.all(
      comments.map(async (comment) => {
        const post = await Post.findById(comment.postId).lean();
        return { ...comment, post };
      })
    );

    res.status(200).json({
      user,
      posts,
      comments,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("id", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    // post db fetch
    const post = await Post.findById(id).lean();
    console.log("post");

    res.status(200).json({ post });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The comment does not exist." });
      return;
    }

    const comment = await Comment.findById(id).lean();

    res.status(200).json(comment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/posts/recent", jwtPartialAuth, async (req, res) => {
  const limit = req.user ? 999999999999999 : POST_LIMIT;
  try {
    const recentPosts = await Post.aggregate([
      {
        $addFields: {
          totalLikes: { $size: "$reactions.likerIds" },
          totalDislikes: { $size: "$reactions.dislikerIds" },
        },
      },
      { $sort: { uploadDate: -1 } },
    ]).limit(limit);

    const formattedRecentPosts = recentPosts.map((post) => ({
      ...post,
      uploadDate: formatDate(post.uploadDate),
    }));

    res.status(200).json(formattedRecentPosts);
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({ error: "Failed to fetch recent posts" });
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

app.get("/api/posts/popular", jwtPartialAuth, async (req, res) => {
  const limit = req.user ? 999999999999999 : POST_LIMIT;
  try {
    const popularPosts = await Post.aggregate([
      {
        $addFields: {
          totalLikes: { $size: "$reactions.likerIds" },
          totalDislikes: { $size: "$reactions.dislikerIds" },
        },
      },
      { $sort: { totalLikes: -1 } },
    ]).limit(limit);

    const formattedPopularPosts = popularPosts.map((post) => ({
      ...post,
      uploadDate: formatDate(post.uploadDate),
    }));

    res.status(200).json(formattedPopularPosts);
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    res.status(500).json({ error: "Failed to fetch popular posts" });
  }
});

// Example: '/search?q=post%20title&t=tag1,tag2&do=asc&po=desc'
app.get("/api/posts/search", async (req, res) => {
  try {
    const titleQuery = req.query.q || "";
    const tagsQuery = req.query.t ? req.query.t.split(",") : null;

    const dateOrder = req.query.do || "asc";
    const popularityOrder = req.query.po || "asc";

    const posts = await Post.aggregate([
      {
        $match: {
          title: {
            $regex: titleQuery,
            $options: "i",
          },
          ...(tagsQuery && { tags: { $all: tagsQuery } }),
        },
      },      
      {
        $addFields: {
          likeCount: { $size: "$reactions.likerIds" },
          dislikeCount: { $size: "$reactions.dislikerIds" },
        },
      },
      {
        $addFields: {
          likeToDislikeRatio: {
            $cond: [
              { $eq: ["$dislikeCount", 0] },
              "$likeCount",
              { $divide: ["$likeCount", "$dislikeCount"] },
            ],
          },
        },
      },
      {
        $sort: {
          title: 1,
          uploadDate: dateOrder === "asc" ? 1 : -1,
          likeToDislikeRatio: popularityOrder === "asc" ? 1 : -1,
        },
      },
    ]);    

    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    const comments = await Comment.find({ postId })
      .populate("commenterId", "username picture")
      .populate({
        path: "commentRepliedToId",
        select: "body commenterId",
        populate: {
          path: "commenterId",
          model: "User",
          select: "username picture",
        },
      })
      .find({
        deleted: false
      })
      // .updateMany(
      //   {},
      //   {
      //     $rename: {
      //       commenterId: "commenter",
      //       commentRepliedToId: "commentRepliedTo",
      //     },
      //   }
      // )
      .lean();
    res.status(200).json(comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST and PUT HTTP requests
apiRouter.put(
  "/users/edit/:id",
  [
    check("username")
      .optional({ values: "falsy" })
      // .withMessage("Username should not be empty.")
      .isLength({ min: 3 })
      .withMessage("Username should be at least 3 characters."),
    check("password")
      .optional({ values: "falsy" })
      // .withMessage("Password should not be empty.")
      .isLength({ min: 7 })
      .withMessage("Password should be at least 7 characters."),
    jwtAuth,
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      let info = {
        ...(req.body.username && { username: req.body.username }),
        ...(req.body.password && {
          password: await bcrypt.hash(req.body.password, 10),
        }),
        ...(req.body.description && { description: req.body.description }),
      };

      const { nModified } = await User.updateOne(
        {
          username: req.user,
        },
        {
          $set: info,
        }
      );

      res.status(nModified === 0 ? 204 : 200).send();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.get("/account/logincheck", jwtAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(200).json({ isNull: true });
      return next();
    }

    const userInfo = await User.findOne({
      username: { $regex: new RegExp(req.user, "i") },
    });

    res.status(200).json({
      _id: userInfo.id,
      username: userInfo.username,
      picture: userInfo.picture,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post(
  "/account/login",
  [
    check("username")
      .notEmpty()
      .withMessage("Username should not be empty.")
      .isLength({ min: 3 })
      .withMessage("Username should be at least 3 characters."),
    check("password")
      .notEmpty()
      .withMessage("Password should not be empty.")
      .isLength({ min: 7 })
      .withMessage("Password should be at least 7 characters."),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { username, password, keepLoggedIn } = req.body;

      const user = await User.findOne({ username });

      const hashedPassword = user.password;
      const passwordMatch = await passwordMatches(password, hashedPassword);

      if (!user || user.deleted || !passwordMatch) {
        console.log("Password does not match");
        return res
          .status(401)
          .send("Login not successful. Invalid username or password.");
      }

      const accessToken = createJwtAccessToken({ username: username });
      const refreshToken = createJwtRefreshToken({ username: username });
      sendRefreshToken(res, refreshToken, keepLoggedIn);
      await User.updateOne(
        { username: username },
        { $set: { refreshToken: refreshToken } }
      );

      return res.status(200).json({ accessToken: accessToken });
    } catch (e) {
      console.error("Error logging in:", e);
      return res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.post(
  "/account/signup",
  [
    check("username")
      .notEmpty()
      .withMessage("Username should not be empty.")
      .isLength({ min: 3 })
      .withMessage("Username should be at least 3 characters."),
    check("password")
      .notEmpty()
      .withMessage("Password should not be empty.")
      .isLength({ min: 7 })
      .withMessage("Password should be at least 7 characters."),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const refreshToken = createJwtRefreshToken({
        username: req.body.username,
      });

      await User.create({
        username: req.body.username,
        password: hashedPassword,
        refreshToken: refreshToken,
      });

      sendRefreshToken(res, refreshToken);
      const accessToken = createJwtAccessToken({ username: req.body.username });
      res.status(201).json({ accessToken: accessToken });
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.post("/account/logout/:id", async (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/" });
    await User.updateOne(
      { refreshToken: req.cookies.refreshToken },
      { $set: { refreshToken: "" } }
    );

    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post(
  "/posts/write",
  [
    jwtAuth,
    multer().array(),
    check("title").notEmpty().withMessage("Post title cannot be empty."),
    check("body").notEmpty().withMessage("Post body cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const poster = await User.findOne({
        username: { $regex: new RegExp(req.user, "i") },
      });

      const newPost = await Post.create({
        title: req.body.title,
        posterId: poster._id,
        body: req.body.body,
        reactions: {
          likerIds: [],
          dislikerIds: [],
        },
        tags: req.body.tags,
      });

      res.status(201).send({ url: `/post/${newPost._id}` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.put(
  "/posts/edit/:id",
  [
    multer().array(),
    check("title").notEmpty().withMessage("Post title cannot be empty."),
    check("body").notEmpty().withMessage("Post body cannot be empty."),
    jwtAuth,
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "The post does not exist." });
        return;
      }

      await Post.updateOne(
        {
          _id: id,
        },
        {
          title: req.body.title,
          body: req.body.body,
          tags: req.body.tags,
        }
      );

      res.status(200).json({ url: `/post/${id}` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.post("/posts/like/:id", jwtAuth, async (req, res) => {
  try {
    console.log("shop 1");
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    console.log("shop 2");
    const liker = await User.findOne({ username: req.user });
    const isIncluded = await Post.findOne({
      _id: id,
      "reactions.likerIds": liker._id,
    });

    console.log("shop 3");
    const { nModified } = !isIncluded
      ? await Post.updateOne(
          {
            _id: id,
          },
          {
            $addToSet: { "reactions.likerIds": liker._id },
            $pull: { "reactions.dislikerIds": liker._id },
          }
        )
      : await Post.updateOne(
          {
            _id: id,
          },
          {
            $pull: {
              "reactions.likerIds": liker._id,
              "reactions.dislikerIds": liker._id,
            },
          }
        );

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot like the post." });
    } else {
      res.status(200).send("Like successfull");
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post("/posts/dislike/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    const disliker = await User.findOne({ username: req.user });
    const isIncluded = await Post.findOne({
      _id: id,
      "reactions.dislikerIds": disliker._id,
    });

    const { nModified } = !isIncluded
      ? await Post.updateOne(
          {
            _id: id,
          },
          {
            $addToSet: { "reactions.dislikerIds": disliker._id },
            $pull: { "reactions.likerIds": disliker._id },
          }
        )
      : await Post.updateOne(
          {
            _id: id,
          },
          {
            $pull: {
              "reactions.likerIds": disliker._id,
              "reactions.dislikerIds": disliker._id,
            },
          }
        );

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot dislike the post." });
    } else {
      res.status(200).send("Dislike Successful");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post("/posts/unreact/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    const unreacter = await User.findOne({ username: req.user });

    const { nModified } = await Post.updateOne(
      {
        _id: id,
      },
      {
        $pull: {
          "reactions.likerIds": unreacter._id,
          "reactions.dislikerIds": unreacter._id,
        },
      }
    );

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot unreact the post." });
    } else {
      res.status(200).send("Unsuccessful");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post(
  "/comments/write",
  [
    check("postId").notEmpty().withMessage("Post ID cannot be empty."),
    check("body").notEmpty().withMessage("Comment body cannot be empty."),
    jwtAuth,
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const commenter = await User.findOne({
        username: { $regex: new RegExp(req.user, "i") },
      });

      const newComment = await Comment.create({
        commenterId: commenter._id,
        postId: req.body.postId,
        commentRepliedToId: req.body.commentRepliedToId ?? null,
        body: req.body.body,
        reactions: {
          likerIds: [],
          dislikerIds: [],
        },
      });

      res.status(201).json({ comment: newComment.toJSON() });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.put(
  "/comments/edit/:id",
  [
    jwtAuth,
    check("body").notEmpty().withMessage("Comment body cannot be empty."),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "The comment does not exist." });
        return;
      }

      const editedComment = await Comment.updateOne(
        {
          _id: id,
        },
        {
          body: req.body.body,
        }
      ).lean();

      res.status(200).json({ comment: editedComment });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.post("/comments/like/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The comment does not exist." });
      return;
    }

    const liker = await User.findOne({ username: req.user });
    const isIncluded = await Comment.findOne({
      _id: id,
      "reactions.likerIds": liker._id,
    });
    console.log("GEGEGGEG", isIncluded);
    const { nModified } = !isIncluded
      ? await Comment.updateOne(
          {
            _id: id,
          },
          {
            $addToSet: { "reactions.likerIds": liker._id },
            $pull: { "reactions.dislikerIds": liker._id },
          }
        )
      : await Comment.updateOne(
          {
            _id: id,
          },
          {
            $pull: {
              "reactions.likerIds": liker._id,
              "reactions.dislikerIds": liker._id,
            },
          }
        );

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot like the comment." });
    } else {
      res.status(200).send("Comment like Successful");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post("/comments/dislike/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The comment does not exist." });
      return;
    }

    const disliker = await User.findOne({ username: req.user });
    console.log("Dislike", disliker);
    const isIncluded = await Comment.findOne({
      _id: id,
      "reactions.dislikerIds": disliker._id,
    });
    const { nModified } = !isIncluded
      ? await Comment.updateOne(
          {
            _id: id,
          },
          {
            $addToSet: { "reactions.dislikerIds": disliker._id },
            $pull: { "reactions.likerIds": disliker._id },
          }
        )
      : await Comment.updateOne(
          {
            _id: id,
          },
          {
            $pull: {
              "reactions.likerIds": disliker._id,
              "reactions.dislikerIds": disliker._id,
            },
          }
        );

    console.log("DDDDDD", nModified);

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot dislike the comment." });
    } else {
      res.status(200).send("Comment dislike Successful");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE HTTP Requests

apiRouter.delete("/users/:id", jwtAuth, async (req, res) => {
  try {
    const currUser = await User.findOne({ _id: req.params.id });

    await User.updateOne(
      {
        _id: currUser._id,
      },
      {
        username: "[Deleted]",
        password: null,
        description: "[Deleted]",
        picture: "https://github.com/shadcn.png",
        deleted: true,
      }
    );

    console.log("WOAG");
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).send(`User ${req.params.id} deleted successfully`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.delete("/posts/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ postId: id });

    res.status(200).send(`post ${req.params.id} deleted successfully`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.delete("/comments/:id", jwtAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The comment does not exist." });
      return;
    }

    await Comment.updateOne(
      {
        _id: id,
      },
      {
        body: "[Deleted]",
        deleted: true,
      }
    );

    res.status(200).send(`comment ${req.params.id} deleted successfully`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
