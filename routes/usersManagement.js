const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../mongoDbConnection");
const user_collections = client.db("ev-tickets").collection("users");

// route 1 : Save user info to db
router.post("/createuser", async (req, res) => {
  const userdata = req.body;
  const user = await user_collections.findOne({ email: userdata.email });
  if (user) {
    return res
      .status(400)
      .json({ newUser: false, message: "User already exists" });
  }
  // set user's default role
  userdata.role = "user";
  const insertData = await user_collections.insertOne(userdata);
  return res.send(insertData);
});

// route 2 : sign jwt
router.post("/jwtSign", async (req, res) => {
  let userData = req.body;
  let token = jwt.sign(userData, process.env.JWT_SECRET);
  return res.send({ token });
});

module.exports = router;
