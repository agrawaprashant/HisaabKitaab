const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");

  //check if token present
  if (!token) {
    res.status(401).json({ msg: "Token not available. Authorisation failed!" });
  }

  //varify the token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.vendor = decoded.vendor;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalid!" });
  }
};
