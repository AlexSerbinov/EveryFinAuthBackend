const express = require("express");
const router = express.Router();
const captcha = require("../controllers/captcha");


router.get("/", async (req, res) => {
    const initedCaptcha = await captcha.init()
    const challange = await initedCaptcha.register();
    res.send(challange)
});

module.exports = router;
