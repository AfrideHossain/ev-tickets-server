const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { client } = require("../mongoDbConnection");
const verifyJwt = require("../middlewares/verifyjwt");
const adminVerify = require("../middlewares/verifyAdmin");
const { ObjectId } = require("mongodb");
const event_collections = client.db("ev-tickets").collection("events");

// route 1: create event and store it to the database
router.post("/createEvent", verifyJwt, adminVerify, async (req, res) => {
  const event = req.body;
  try {
    const result = await event_collections.insertOne(event);
    return res.send(result);
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

// route 2 : get all events
router.get("/getEvents", async (req, res) => {
  try {
    const events = await event_collections.find().toArray();
    return res.send(events);
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
});

// route 3: get an specific events full information
router.get("/getEvent/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const eventDetails = await event_collections.findOne({
      _id: new ObjectId(id),
    });
    if (!eventDetails) {
      return res.status(404).send("Event not found");
    }
    return res.send(eventDetails);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
