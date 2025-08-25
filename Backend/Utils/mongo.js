"use strict";

const { MongoClient } = require("mongodb");

let client;
let db;

/**

Connect once and reuse the same DB instance.

The database name is taken from the URI path.
*/
async function connectMongo(uri) {
if (db) return db;
client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await client.connect();
db = client.db();
await db.command({ ping: 1 });
return db;
}

function getDb() {
if (!db) throw new Error("MongoDB not initialized. Call connectMongo(uri) first.");
return db;
}

async function closeMongo() {
if (client) await client.close();
client = undefined;
db = undefined;
}

module.exports = { connectMongo, getDb, closeMongo };