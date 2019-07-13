const express = require("express");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const client = require("../../config/db");

const router = express.Router();

//@route POST /api/auth
//@desc login vendor
//@access Public

router.post(
  "/",
  [
    check("email", "Include a valid email.").isEmail(),
    check("password", "Include a valid password").exists()
  ],
  async (req, res) => {
    const { email, password } = req.body;

    try {
      //check if email is present
      const queryResult = await client.query(
        `SELECT * FROM vendor WHERE email = '${email}'`
      );
      if (queryResult.rowCount === 0) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //verifying vendor password
      const isMatch = await bcrypt.compare(
        password,
        queryResult.rows[0].password
      );

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //return jsonwebtoken
      const payload = {
        vendor: {
          id: queryResult.rows[0].vendor_id
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({ token });
          }
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);

module.exports = router;
