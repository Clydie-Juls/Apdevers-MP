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
    try {
      const user = await User.findOne({ username: jwtPayload.username }).lean();
      if (user) {
        done(null, user.username);
      } else {
        done(null, false);
      }
    } catch (e) {
      done(e, false);
    }
  })
);

export const jwtAuth = [
  generateNewAccessToken,
  passport.authenticate("jwt", {
    session: false,
  }),
];

export const jwtPartialAuth = [
  generateNewAccessToken,
  (req, res, next) =>
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (!info) {
        req.user = user;
      }
      next();
    })(req, res, next),
];

export function createJwtAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "20s",
  });
}

function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    const expirationTime = decoded.exp * 1000; // Convert seconds to milliseconds
    const currentTime = Date.now();
    return currentTime > expirationTime;
  } catch (err) {
    // Handle invalid token or other errors
    return true; // Assume expired for safety (or handle appropriately)
  }
}

export function createJwtRefreshToken(payload, expiresIn = "14d") {
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: expiresIn,
  });
}

export async function generateNewAccessToken(req, res, next) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(); // Handle missing refresh token
  }

  const [, accessToken] = req.headers.authorization
    ? req.headers.authorization?.split(" ")
    : " ";
  if (isTokenExpired(accessToken)) {
    try {
      await jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
      const user = await User.findOne({ refreshToken: refreshToken }).lean();

      if (user) {
        const newAccessToken = createJwtAccessToken({
          username: user.username,
        });
        res.setHeader("authorization", `Bearer ${newAccessToken}`);
        req.headers.authorization = `Bearer ${newAccessToken}`;
        return next();
      }
    } catch (err) {
      console.log("Rick Astley - Considers giving you up.");
    }
  }
  next();
}

export const revalidateRefreshToken = async (req, res, next) => {
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
};
