const express = require("express");
const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017/issuetracker";
let db;
const app = express();
let aboutMessage = "Issue Tracker API v1.0";

async function connectToDb() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log("Connected to MongoDB at", url);
  db = client.db();
}
async function issueList() {
  try {
    const issues = await db.collection("issues").find({}).toArray();
    return issues;
  } catch (err) {
    console.error("Error fetching issues:", err);
    throw err;
  }
}
app.get("/issues", async (req, res) => {
  try {
    const issues = await issueList();
    res.json(issues);
  } catch (err) {
    res.status(500).send("Error fetching issues");
  }
});
(async function () {
  try {
    await connectToDb();
    app.listen(3000, function () {
      console.log("App started on port 3000");
    });
  } catch (err) {
    console.log("ERROR:", err);
  }
})();
