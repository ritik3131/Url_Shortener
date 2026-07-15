CREATE TABLE IF NOT EXISTS short_links (
  code VARCHAR(7) PRIMARY KEY,
  destination_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS short_links_created_at_idx ON short_links (created_at);

CREATE TABLE IF NOT EXISTS outbox_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  aggregate_id VARCHAR(7) NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS outbox_events_unpublished_idx ON outbox_events (id) WHERE published_at IS NULL;
