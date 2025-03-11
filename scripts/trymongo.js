const { MongoClient } = require("mongodb");
const url = "mongodb://127.0.0.1:27017/issuetracker";

function testWithCallbacks(callback) {
  console.log("\n--- testWithCallbacks ---");
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect(function (err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log("connected to MongoDB");
    const db = client.db();
    const collection = db.collection("employees");
    const employee = { id: 1, name: "A.Callback", age: 23 };
    collection.insertOne(employee, function (err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log("Result of insert:\n", result.insertedId);
      collection.find({ _id: result.insertedId }).toArray(function (err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log("Result of find:\n", docs);
        client.close();
        callback(err);
      });
    });
  });
}
testWithCallbacks(function (err) {
  if (err) {
    console.log(err);
  }
});
/*PS C:\Users\valw\Desktop\IBAW\TheMernStack\my-issue-tracker> node .\scripts\trymongo.js

--- testWithCallbacks ---
MongoServerSelectionError: connect ECONNREFUSED ::1:27017
    at Timeout._onTimeout (C:\Users\valw\Desktop\IBAW\TheMernStack\my-issue-tracker\node_modules\mongodb\lib\core\sdam\topology.js:438:30)
    at listOnTimeout (node:internal/timers:614:17)
    at process.processTimers (node:internal/timers:549:7) {
  reason: TopologyDescription {
    type: 'Single',
    setName: null,
    maxSetVersion: null,
    maxElectionId: null,
    servers: Map(1) { 'localhost:27017' => [ServerDescription] },
    stale: false,
    compatible: true,
    compatibilityError: null,
    logicalSessionTimeoutMinutes: null,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    commonWireVersion: null
  }
} */
