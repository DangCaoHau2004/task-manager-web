import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "yourpassword",
  database: process.env.PG_DB || "yourdatabase",
});
db.connect();
export default db;
