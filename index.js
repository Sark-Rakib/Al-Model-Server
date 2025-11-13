const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oibnujx.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("ai-model-db");
    const modelColl = db.collection("models");
    const purchaseColl = db.collection("purchase");
    // get api to add models

    app.get("/models", async (req, res) => {
      const cursor = modelColl.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/models/latest", async (req, res) => {
      const cursor = modelColl.find().sort({ createdAt: -1 }).limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    // post api to add models

    app.post("/models", async (req, res) => {
      const data = req.body;
      const result = await modelColl.insertOne(data);
      res.send(result);
    });

    // find one data by id

    app.get("/models/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await modelColl.findOne(filter);
      res.send(result);
    });

    // update api
    app.put("/models/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedData = req.body;

      const updateDoc = {
        $set: updatedData,
      };
      const result = await modelColl.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete api

    app.delete("/models/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await modelColl.deleteOne(filter);
      res.send(result);
    });

    app.get("/myModel", async (req, res) => {
      const email = req.query.email;
      const filter = { createdBy: email };
      const result = await modelColl.find(filter).toArray();
      res.send(result);
    });

    app.post("/purchase/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const result = await purchaseColl.insertOne(data);
      const filter = {
        _id: new ObjectId(id),
      };
      const update = {
        $inc: {
          purchased: 1,
        },
      };
      const purchaseCount = await modelColl.updateOne(filter, update);
      res.send(result, purchaseCount);
    });

    app.get("/purchase", async (req, res) => {
      const result = await purchaseColl.find().toArray();
      res.send(result);
    });

    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await purchaseColl.deleteOne(query);
      res.send(result);
    });

    app.delete("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const result = await purchaseColl.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/myModel/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await modelColl.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
