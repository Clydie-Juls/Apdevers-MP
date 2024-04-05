import { Router } from "express";
import multer from "multer";
import { User } from "../../models/user.js";
import { Post } from "../../models/post.js";
import { Comment } from "../../models/comment.js";
import mongoose from "mongoose";
import { jwtAuth } from "../../middleware/auth.js";
import bcrypt from "bcrypt";
import { check, validationResult } from "express-validator";

const upload = multer({ dest: "server/images/" });
const userRouter = Router();

userRouter.post("/picture/:id", upload.single("file"), async (req, res) => {
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
});

userRouter.put(
  "/edit/:id",
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

userRouter.delete("/:id", jwtAuth, async (req, res) => {
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

    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).send(`User ${req.params.id} deleted successfully`);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: "The user does not exist." });
      return;
    }

    const user = await User.findById(id).select('-password').lean();
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

export default userRouter;
