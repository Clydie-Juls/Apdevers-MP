import { Router } from "express";
import {
  jwtAuth,
  createJwtAccessToken,
  createJwtRefreshToken,
} from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import { validationResult, check } from "express-validator";
import bcrypt from "bcrypt";

const passwordMatches = async (password, hash) => {
  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Error comparing passwords", hash);
  }
};

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

const accountRouter = Router();

accountRouter.get("/logincheck", jwtAuth, async (req, res, next) => {
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

accountRouter.post(
  "/login",
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

accountRouter.post(
  "/signup",
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

accountRouter.post("/logout/:id", async (req, res) => {
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

export default accountRouter;
