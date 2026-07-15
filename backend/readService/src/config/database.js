import cassandra from "cassandra-driver";
import { env } from "./env.js";
export const cassandraClient = new cassandra.Client({
  contactPoints: env.cassandraContactPoints,
  localDataCenter: "datacenter1",
  keyspace: "url_shortener",
});
