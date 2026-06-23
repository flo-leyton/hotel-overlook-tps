const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const defaultDatabasePath = path.resolve(
  __dirname,
  "..",
  "database",
  "hotel_overlook_tps.sqlite"
);
const databasePath = path.resolve(
  process.env.SQLITE_PATH || process.env.DB_PATH || defaultDatabasePath
);

if (!fs.existsSync(databasePath)) {
  throw new Error(
    `No se encontró la base de datos SQLite en: ${databasePath}. ` +
      "Inicialícela con database/schema.sql y database/seed.sql."
  );
}

let db;

try {
  db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
} catch (error) {
  throw new Error(`No fue posible abrir SQLite: ${error.message}`);
}

module.exports = db;
module.exports.databasePath = databasePath;
