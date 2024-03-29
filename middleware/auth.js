import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    console.log(jwtPayload);
    try {
      const user = await User.findOne({ username: jwtPayload.username }).lean();
      if (user) {
        done(null, { user: user.username });
      } else {
        done(null, false);
      }
    } catch (e) {
      done(e, false);
    }
  })
);

export const jwtAuth = (req, res, next) =>
  passport.authenticate(
    "jwt",
    { session: false },
    (err, user, info, status) => {
      if (info && info.name && info.name === "TokenExpiredError") {
        res.status(401).json({ message: info.name });
      } else if (
        info &&
        info.name &&
        (info.name === "JsonWebTokenError" || info.name === "NoAuthToken")
      ) {
        res.status(401).send({ message: "Unauthorized" });
      } else if (info) {
        res.status(401).send({ message: info.name });
      } else {
        req.user = user;
        next();
      }
    }
  )(req, res, next);

export const jwtPartialAuth = (req, res, next) =>
  passport.authenticate(
    "jwt",
    { session: false },
    (err, user, info, status) => {
      if (info && info.name && info.name === "TokenExpiredError") {
        return res.status(401).json({ message: info.name });
      } else if (
        info &&
        info.name &&
        (info.name === "JsonWebTokenError" || info.name === "NoAuthToken")
      ) {
      } else if (info) {
      } else {
        req.user = user;
      }
      next();
    }
  )(req, res, next);

export function createJwtAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "20s",
  });
}

export function createJwtRefreshToken(payload, expiresIn = "14d") {
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: expiresIn,
  });
}

export async function generateNewAccessToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  const user = await User.findOne({ refreshToken: refreshToken }).lean();
  if (!user) {
    console.log("Refresh Token not recognized");
    return res.status(401).redirect("/login");
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    async (err, payload) => {
      if (err) {
        console.log("Invalid Refresh Token");
        return res.status(401).redirect("/login");
      } else {
        const user = await User.findOne({ refreshToken: refreshToken }).lean();
        if (user) {
          const accessToken = createJwtAccessToken({
            username: payload.username,
          });
          return res.json({ accessToken: accessToken });
        }

        console.log("Invalid Refresh Token");
        return res.status(401).redirect("/login");
      }
    }
  );
}

export let loggedInUsername;

export function setLoggedInUser(name) {
  if (loggedInUsername) {
    console.warn("Replacing an already logged-in user...");
  }

  loggedInUsername = name;
}

export function isAuth(req, res, next) {
  if (req.originalUrl.startsWith("/api/posts")) {
    next();
  } else {
    if (loggedInUsername) {
      next();
    } else {
      res.redirect("/login");
    }
  }
}
