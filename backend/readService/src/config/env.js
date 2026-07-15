import 'dotenv/config';
export const env = {
  port: Number(process.env.PORT ?? 3002),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  cassandraContactPoints: (process.env.CASSANDRA_CONTACT_POINTS ?? 'localhost').split(',')
};
