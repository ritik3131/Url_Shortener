CREATE KEYSPACE IF NOT EXISTS url_shortener WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
CREATE TABLE IF NOT EXISTS url_shortener.links_by_code (code text PRIMARY KEY, destination_url text, created_at timestamp);
