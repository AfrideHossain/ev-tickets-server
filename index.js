const express = require("express");
const app = express();
const cors = require("cors");
const { connectMongo } = require("./mongoDbConnection");
require("dotenv").config();
const port = process.env.PORT || 5000;

//call mongodb connection function
connectMongo();

// cors and cors configuration
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

//json middleware
app.use(express.json());

// routes
app.get("/", (req, res) => {
  res.send("Ev-Tickets going good...");
});

// users management route
app.use("/", require("./routes/usersManagement"));
// events management route
app.use("/", require("./routes/eventsManagement"));

app.listen(port, () => {
  console.log(`Ev-Tickets listening on port ${port}`);
});
