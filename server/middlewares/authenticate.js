// middlewares/authenticate.js
const jwt = require("jsonwebtoken");
const User = require("../models/schema");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({ _id: verifyToken._id });
    if (!rootUser) return res.status(401).json({ error: "User not found" });

    req.token = token;
    req.rootUser = rootUser; // attach full user including passwords
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authenticate;
