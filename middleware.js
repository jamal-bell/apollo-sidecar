import session from "express-session";

const middleware = {
  //session set up
  session: (app) => {
    app.use(
      session({
        name: "Apollo-Sidecar",
        secret: "This is a secret.. shhh don't tell anyone",
        saveUninitialized: false,
        resave: false,
        cookie: { maxAge: 6000000 },
      })
    );
  },

  //user middleware
  user: (app) => {
    //user
    app.use("/user", async (req, res, next) => {
      if (req.originalUrl === "/user") {
        if (req.session.authenticated) {
          if (req.session.user.role === "admin") {
            return res.redirect("/user/admin");
          } else if (req.session.user.role === "user") {
            return res.redirect("/user/account");
          }
        } else {
          return res.redirect("/user/login");
        }
      }
      next();
    });

    //login middleware
    app.use("/user/login", async (req, res, next) => {
      if (req.method == "GET" && req.session.authenticated) {
        if (req.session.user.role === "admin") {
          return res.redirect("/user/admin");
        } else if (req.session.user.role === "user") {
          return res.redirect("/user/user");
        }
      }
      next();
    });

    //register middleware
    app.use("/user/register", async (req, res, next) => {
      if (req.method == "GET" && req.session.authenticated) {
        if (req.session.user.role === "admin") {
          return res.redirect("/user/admin");
        } else if (req.session.user.role === "user") {
          return res.redirect("/user/user");
        }
      }
      next();
    });

    //profile
    app.use("/user/profile", async (req, res, next) => {
      if (req.method == "GET" && !req.session.authenticated) {
        return res.redirect("/user/login");
      } else {
        return res.redirect("/user");
      }
    });

    //user
    app.use("/user/user", async (req, res, next) => {
      if (req.method == "GET" && req.session.authenticated) {
        if (req.session.user.role !== "user") {
          return res.redirect("/user/admin");
        }
      } else {
        return res.redirect("/user/login");
      }
      next();
    });

    //admin
    app.use("/user/admin", async (req, res, next) => {
      if (req.method == "GET" && req.session.authenticated) {
        if (req.session.user.role !== "admin") {
          return res.render("user/error", {
            error: "You don't have access to admin page.",
          });
        }
      } else {
        return res.redirect("/user/login");
      }
      next();
    });

    //logout
    app.use("/user/logout", async (req, res, next) => {
      if (req.method == "GET" && !req.session.authenticated) {
        return res.redirect("/user/login");
      }
      next();
    });
  },

  //lesson middleware
  lesson: (app) => {},
  //qa middleware
  qa: (app) => {},
  //home middleware
  home: (app) => {},
};

export default middleware;
