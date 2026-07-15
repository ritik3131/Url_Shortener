import { cassandraClient } from "../config/database.js";
export async function findByCode(code) {
  return cassandraClient.execute(
    "SELECT destination_url FROM links_by_code WHERE code = ?",
    [code],
    { prepare: true },
  );
}