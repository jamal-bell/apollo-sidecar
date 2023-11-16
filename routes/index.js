import homeRoutes from "./home.js";
import lessonRoutes from "./lessons.js";
import qaRoutes from "./qa.js"
import userRoutes from "./userProfile.js"

const constructorMethod = (app) => {
  app.use("/", homeRoutes);
  app.use("/lessons", lessonRoutes);
  app.use("/qaforum", qaRoutes);
  app.use("/user",userRoutes);
  app.use("/login",userRoutes);
  app.use("/searchResults",userRoutes);
  app.use("*", (req, res) => {
    res.status(404).render("error", { errorMessage: `404` });
  });
};

export default constructorMethod;