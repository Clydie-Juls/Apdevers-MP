import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { Post } from "../models/post.js";
import { Comment } from "../models/comment.js";
import {
  jwtAuth,
  createJwtAccessToken,
  createJwtRefreshToken,
  generateNewAccessToken,
  jwtPartialAuth,
} from "../middleware/auth.js";
import dotenv from "dotenv";
import passport from "passport";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = 3000;
const apiRouter = express.Router();

mongoose.connect("mongodb://127.0.0.1:27017/T3Db");

const POST_LIMIT = 10;

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

function sendRefreshToken(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // milliseconds to 14 days(2 weeks)
    secure: true,
  });
}

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
    const posts = await Post.find().sort({ uploadDate: -1 }).limit(limit);

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      uploadDate: formatDate(post.uploadDate),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
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
apiRouter.get("/posts/search", async (req, res) => {
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
apiRouter.put("/users/edit/:id", jwtAuth, async (req, res) => {
  try {
    let info = req.body;
    if (info.password) {
      info.password = await bcrypt.hash(req.body.password, 10);
    }

    const { nModified } = await User.updateOne(
      {
        username: req.user.user,
      },
      {
        $set: req.body,
      }
    );

    res.status(nModified === 0 ? 204 : 200).send();
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get("/account/logincheck", jwtAuth, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(200).json({ isNull: true });
      return next();
    }

    const userInfo = await User.findOne({
      username: { $regex: new RegExp(req.user.user, "i") },
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

apiRouter.post("/account/token", generateNewAccessToken);

apiRouter.post("/account/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .send("Login not successful. Invalid username or password.");
    }

    const hashedPassword = user.password;

    const passwordMatch = await passwordMatches(password, hashedPassword);

    if (!passwordMatch) {
      console.log("Password does not match");
      return res
        .status(401)
        .send("Login not successful. Invalid username or password.");
    }

    const accessToken = createJwtAccessToken({ username: username });
    const refreshToken = createJwtRefreshToken({ username: username });
    sendRefreshToken(res, refreshToken);
    await User.updateOne(
      { username: username },
      { $set: { refreshToken: refreshToken } }
    );

    return res.status(200).json({ accessToken: accessToken });
  } catch (e) {
    console.error("Error logging in:", e);
    return res.status(500).json({ error: e.message });
  }
});

apiRouter.post("/account/signup", async (req, res) => {
  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const refreshToken = createJwtRefreshToken({ username: req.body.username });
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      refreshToken: refreshToken,
    });

    user.save();
    const accessToken = createJwtAccessToken({ username: req.body.username });

    console.log("5");
    sendRefreshToken(res, refreshToken);
    res.status(201).json({ accessToken: accessToken });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ error: e.message });
  }
});

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
  [jwtAuth, multer().array()],
  async (req, res) => {
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

      res.status(201).json({ url: `/post/${newPost._id}` });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

apiRouter.put(
  "/posts/edit/:id",
  [jwtAuth, multer().array()],
  async (req, res) => {
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The post does not exist." });
      return;
    }

    const liker = await User.findOne({ username: req.user });
    const isIncluded = await Post.findOne({
      _id: id,
      "reactions.likerIds": liker._id,
    });

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

apiRouter.post("/comments/write", jwtAuth, async (req, res) => {
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
});

apiRouter.put("/comments/edit/:id", jwtAuth, async (req, res) => {
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
});

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

    await User.deleteOne({ _id: currUser._id });
    await Post.deleteMany({ posterId: currUser._id });
    await Comment.deleteMany({ commenterId: currUser._id });

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

    await Comment.deleteOne({ _id: id });

    res.status(200).send(`comment ${req.params.id} deleted successfully`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
