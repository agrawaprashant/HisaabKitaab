const { Client } = require("pg");

const connectionString =
  "postgressql://postgres:bcpl5441@localhost:5432/HisaabKitaab";

const client = new Client({
  connectionString: connectionString
});

module.exports = client;
