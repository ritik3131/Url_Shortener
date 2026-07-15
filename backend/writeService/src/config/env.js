import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  workerId: Number(process.env.WORKER_ID ?? 1),
  customEpochSeconds: Number(process.env.CUSTOM_EPOCH_SECONDS ?? 1735689600),
  kafkaBrokers: required('KAFKA_BROKERS').split(','),
  kafkaTopic: process.env.KAFKA_TOPIC ?? 'short-link-created'
};
