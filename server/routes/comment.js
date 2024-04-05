import { Router } from "express";
import mongoose from "mongoose";
import { validationResult, check } from "express-validator";
import { jwtAuth } from "middleware/auth";
import { User } from "models/user";
import { Comment } from "models/comment";

const commentRouter = Router();

commentRouter.get("/:id", async (req, res) => {
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

commentRouter.post(
  "/write",
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

commentRouter.put(
  "/edit/:id",
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

commentRouter.post("/like/:id", jwtAuth, async (req, res) => {
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

commentRouter.post("/dislike/:id", jwtAuth, async (req, res) => {
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

    if (nModified === 0) {
      res.status(204).json({ error: "Cannot dislike the comment." });
    } else {
      res.status(200).send("Comment dislike Successful");
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

commentRouter.delete("/:id", jwtAuth, async (req, res) => {
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

export default commentRouter;
