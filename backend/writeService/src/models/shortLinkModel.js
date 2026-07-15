import { cassandraClient } from "../config/database.js";
export async function insertShortLinkIfAbsent({
  code,
  destinationUrl,
  createdAt,
}, client = cassandraClient) {
  const result = await client.execute(
    "INSERT INTO links_by_code (code, destination_url, created_at) VALUES (?, ?, ?) IF NOT EXISTS",
    [code, destinationUrl, createdAt],
    { prepare: true },
  );
  return result.first()["[applied]"];
}
