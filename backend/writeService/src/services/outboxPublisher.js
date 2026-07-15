import { env } from "../config/env.js";
import { producer } from "../config/kafka.js";
import { pool } from "../config/database.js";

export async function publishPendingEvents() {
  const { rows } = await pool.query(
    "SELECT id, aggregate_id, payload FROM outbox_events WHERE published_at IS NULL ORDER BY id LIMIT 100",
  );
  for (const event of rows) {
    await producer.send({
      topic: env.kafkaTopic,
      messages: [
        { key: event.aggregate_id, value: JSON.stringify(event.payload) },
      ],
    });
    await pool.query(
      "UPDATE outbox_events SET published_at = NOW() WHERE id = $1",
      [event.id],
    );
  }
}
