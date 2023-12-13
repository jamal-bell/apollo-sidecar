import session from "express-session";

const middleware = {
  //lesson middleware
  lesson: (app) => {
    //new lesson middleware
    app.use("/lesson/newlesson", async (req, res, next) => {
      if (req.method == "GET" && !req.session.authenticated) {
        return res.redirect("/user/login");
      }
      next();
    });
  },
};

export default middleware;