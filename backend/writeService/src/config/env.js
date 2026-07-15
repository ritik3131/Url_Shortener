import 'dotenv/config';
const required = (name) => { if (!process.env[name]) throw new Error(`${name} is required`); return process.env[name]; };
export const env = { port: Number(process.env.PORT ?? 3001), cassandraContactPoints: required('CASSANDRA_CONTACT_POINTS').split(','), redisUrl: required('REDIS_URL'), workerId: Number(process.env.WORKER_ID ?? 1), customEpochSeconds: Number(process.env.CUSTOM_EPOCH_SECONDS ?? 1735689600) };
