import { Router } from "express";
import { Post } from "../../models/post.js";
import mongoose from "mongoose";
import { jwtPartialAuth, jwtAuth } from "../../middleware/auth.js";
import multer from "multer";
import { validationResult, check } from "express-validator";
import { User } from "../../models/user.js";

const POST_LIMIT = 15;
const postRouter = Router();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

postRouter.post(
  "/write",
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

postRouter.put(
  "/edit/:id",
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

postRouter.post("/like/:id", jwtAuth, async (req, res) => {
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

postRouter.post("/dislike/:id", jwtAuth, async (req, res) => {
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

postRouter.post("/unreact/:id", jwtAuth, async (req, res) => {
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

postRouter.delete("/:id", jwtAuth, async (req, res) => {
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

postRouter.get("/recent", jwtPartialAuth, async (req, res) => {
  console.log("/recent");
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

postRouter.get("/popular", jwtPartialAuth, async (req, res) => {
  console.log("popopop");
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
postRouter.get("/search", async (req, res) => {
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

postRouter.get("/:postId/comments", async (req, res) => {
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
        deleted: false,
      })
      .lean();
    res.status(200).json(comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

postRouter.get("/:id", async (req, res) => {
  console.log("/recent");
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

export default postRouter;
