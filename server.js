const express = require("express");

const client = require("./config/db");

//connect Database
client.connect(err => {
  if (err) {
    console.log(err);
    process.exit(1);
  } else {
    console.log("Database Connected!");
  }
});

const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hisab Kitab API is Running!");
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
app.use("/api/vendors", require("./routes/api/vendors"));
// app.use("/api/vendor-profile", require("./routes/api/vendor-profile"));
// app.use("/api/payments", require("./routes/api/payments"));
// app.use("/api/reports", require("./routes/api/reports"));
app.use("/api/auth", require("./routes/api/auth"));
