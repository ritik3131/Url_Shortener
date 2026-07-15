import { Kafka } from 'kafkajs';
import { env } from './env.js';
const kafka = new Kafka({ clientId: 'write-service', brokers: env.kafkaBrokers });
export const producer = kafka.producer();
