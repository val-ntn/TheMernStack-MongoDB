const express = require("express");
const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017/issuetracker";
let db;
const app = express();
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next();
});

async function connectToDb() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log("Connected to MongoDB at", url);
  db = client.db();
}
async function getNextSequence(name) {
  const result = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: name },
      { $inc: { current: 1 } },
      { returnDocument: "after" }
    );
  return result.value.current;
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

async function issueAdd(req, res) {
  const issue = req.body;
  if (!issue.title || issue.title.length < 3) {
    return res
      .status(400)
      .json({ error: "Title must be at least 3 characters long." });
  }
  if (issue.status === "Assigned" && !issue.owner) {
    return res
      .status(400)
      .json({ error: 'Owner is required when status is "Assigned".' });
  }
  issue.created = new Date();
  issue.id = await getNextSequence("issues");

  try {
    const result = await db.collection("issues").insertOne(issue);
    const savedIssue = await db
      .collection("issues")
      .findOne({ _id: result.insertedId });
    res.json(savedIssue);
  } catch (err) {
    console.error("Error adding issue:", err);
    res.status(500).send("Error adding issue");
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

app.post("/issues", issueAdd);

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
