const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
const client = require("../../config/db");

const router = express.Router();

//@route POST api/vendors
//@desc Register vendors
//@access Public

router.post(
  "/",
  [
    check("firstName", "First name is required")
      .not()
      .isEmpty(),
    check("lastName", "lastName is required")
      .not()
      .isEmpty(),
    check("email", "Valid email address is required").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(email);
    //see if vendor already exists
    try {
      let vendor = await client.query(
        `SELECT * FROM vendor where email = '${email}'`
      );
      let rowCount = vendor.rowCount;

      if (rowCount !== 0) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Vendor already exists!" }] });
      }

      // Get vendor's gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      //Encrypt password
      let encryptedPassword = "";
      const salt = await bcrypt.genSalt(10);
      encryptedPassword = await bcrypt.hash(password, salt);

      //Inserting data to vendor table
      await client.query(
        `INSERT INTO vendor (first_name, last_name, email, password, gravatar_img) VALUES ('${firstName}','${lastName}','${email}','${encryptedPassword}','${avatar}')`
      );
      let queryResult = await client.query(
        `SELECT vendor_id FROM vendor where email = '${email}'`
      );
      const vendorId = queryResult.rows[0].vendor_id;
      //Retrun jsonWebToken
      const payload = {
        vendor: {
          id: vendorId
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
  }
);

module.exports = router;
