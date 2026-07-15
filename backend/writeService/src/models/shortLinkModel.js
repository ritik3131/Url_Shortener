import { pool } from "../config/database.js";

export async function insertShortLinkWithOutbox({ code, destinationUrl }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      rows: [link],
    } = await client.query(
      "INSERT INTO short_links (code, destination_url) VALUES ($1, $2) RETURNING code, destination_url, created_at",
      [code, destinationUrl],
    );
    await client.query(
      "INSERT INTO outbox_events (event_type, aggregate_id, payload) VALUES ($1, $2, $3)",
      [
        "ShortLinkCreated",
        code,
        JSON.stringify({ code, destinationUrl, createdAt: link.created_at }),
      ],
    );
    await client.query("COMMIT");
    return link;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
