const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyjwt");
const { ObjectId } = require("mongodb");
const user_collections = client.db("ev-tickets").collection("users");
const event_collections = client.db("ev-tickets").collection("events");

// route 1 : Save user info to db
router.post("/createuser", async (req, res) => {
  const userdata = req.body;
  const user = await user_collections.findOne({ email: userdata.email });
  if (user) {
    return res
      .status(400)
      .json({ newUser: false, message: "User already exists" });
  }
  // set user's default properties
  userdata.role = "user";
  userdata.bookings = [];
  const insertData = await user_collections.insertOne(userdata);
  return res.send(insertData);
});

// route 2 : sign jwt
router.post("/jwtSign", async (req, res) => {
  let userData = req.body;
  try {
    let token = jwt.sign(userData, process.env.JWT_SECRET);
    const userRole = await user_collections.findOne(
      { email: userData.email },
      { projection: { role: 1 } }
    );
    return res.send({ token, role: userRole.role });
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
});

// route 3: get specific user's information
router.get("/profile", verifyJwt, async (req, res) => {
  try {
    const user = await user_collections.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.send(user);
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

// route 4: add to cart
router.put("/booking/:id", verifyJwt, async (req, res) => {
  const bookingId = req.params.id;
  const user = req.user;
  try {
    // get previous booking and store it in an array
    const getPreviousBooking = await user_collections.findOne(
      { email: user.email },
      { projection: { bookings: 1 } }
    );
    const previousBookingArray = getPreviousBooking?.bookings || [];
    // console.log("previousBookingArray ", previousBookingArray);
    if (previousBookingArray.includes(bookingId)) {
      return res.json({ success: false, msg: "Already booked a ticket" });
    }

    const newBookingArray = [...previousBookingArray, bookingId];
    // console.log("newBookingArray ", newBookingArray);
    const updateBookings = await user_collections.updateOne(
      { email: user.email },
      { $set: { bookings: newBookingArray } }
    );
    if (updateBookings.modifiedCount > 0) {
      return res.json({ success: true, msg: "Bookings added" });
    } else {
      return res.json({ success: false, msg: "Failed to add bookings" });
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).send("Internal server error");
  }
});
// route 5 : get all bookings
router.get("/bookings", verifyJwt, async (req, res) => {
  const user = req.user;
  try {
    const getBookingsIds = await user_collections.findOne(
      { email: user.email },
      {
        projection: { bookings: 1 },
      }
    );

    if (!getBookingsIds?.bookings?.length > 0) {
      return res.send([]);
    }

    const bookingsIds = getBookingsIds.bookings || [];

    const bookingDetailsArr = await Promise.all(
      bookingsIds.map(async (id) => {
        return await event_collections.findOne({ _id: new ObjectId(id) });
      })
    );

    return res.send(bookingDetailsArr);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
