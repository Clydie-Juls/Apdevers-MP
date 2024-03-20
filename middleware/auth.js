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
