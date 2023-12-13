import { Router } from "express";

const router = Router();

router.route("/").get(async (req, res) => {
    //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
    res.render("pages/home", { title: "AP Sidecar", style_partial: "css_home" });
  });

export default router;
