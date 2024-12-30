import Redis from 'ioredis';
import Redlock, { ResourceLockedError } from 'redlock';

import logger from './logger';
import RollerCoaster from '../structures/RollerCoaster';
import { type IRollerCoaster } from '../types/rollerCoaster';
import { MessageTypes, type MessagePayload } from '../types/redis';

const SYNC_REDIS_CHANNEL = `${process.env.ENV_NAME}:sync`;
const UNDEFINED_PARAMS_MSG = 'Redis host or port not specified';
const host = process.env.REDIS_HOST;
const port = parseInt(process.env.REDIS_PORT || '', 10);

let subscriberInstance: Redis | null = null;
let publisherInstance: Redis | null = null;
let lockInstance: Redlock | null = null;

function getRedisInstance(
    resolve: () => void,
    reject: () => void,
): Redis | null {
    if (!host || !port) {
        logger.error(UNDEFINED_PARAMS_MSG);
        reject();
        return null;
    }

    const redis = new Redis({ host, port });

    redis.on('error', (error) => {
        logger.warn('Error connecting redis: ' + error + ' reconnecting ...');

        resolve();
    });

    return redis;
}

export function initSubscriber(): Promise<void> {
    if (subscriberInstance) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const subscriber = getRedisInstance(resolve, reject);

        subscriber?.on('connect', () => {
            logger.info('Redis subscriber connected');
            subscriberInstance = subscriber;

            subscriberInstance.on('message', (channel, message) => {
                if (channel === SYNC_REDIS_CHANNEL) {
                    handleMessage(message);
                }
            });

            subscriberInstance.subscribe(SYNC_REDIS_CHANNEL, (error) => {
                if (error) {
                    logger.error(
                        'Error subscribing on channel: ' + SYNC_REDIS_CHANNEL,
                    );
                } else {
                    logger.info(
                        'Redis subscribed to channel: ' + SYNC_REDIS_CHANNEL,
                    );
                }

                resolve();
            });
        });
    });
}

export function initPublisher(): Promise<void> {
    if (publisherInstance) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const publisher = getRedisInstance(resolve, reject);

        publisher?.on('connect', () => {
            logger.info('Redis publisher connected');
            publisherInstance = publisher;
            resolve();
        });
    });
}

export function initLock(): Promise<void> {
    if (lockInstance) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const redis = getRedisInstance(resolve, reject);
        if (!redis) {
            return;
        }

        const redlock = new Redlock([redis], {
            retryCount: 5,
            retryDelay: 300,
            retryJitter: 300,
        });

        redlock.on('error', (err) => {
            if (err instanceof ResourceLockedError) {
                resolve();
                return;
            }

            logger.error('Error connecting redlock: ' + err);
            resolve();
        });

        redis.on('connect', () => {
            logger.info('Redis lock connected');
            lockInstance = redlock;
            resolve();
        });
    });
}

async function handleMessage(message: string) {
    try {
        const { data, type } = JSON.parse(message) as MessagePayload;

        switch (type) {
            case MessageTypes.SYNC: {
                const rollerCoaster = new RollerCoaster(data as IRollerCoaster);
                await rollerCoaster.save();
                break;
            }
            default:
                logger.warn(`Wrong message type: ${type}`);
                break;
        }
    } catch (error) {
        logger.error('Cannot parse message from redis: ' + error);
    }
}

export async function publishMessage({ data, type }: MessagePayload) {
    const isConnected = checkRedisConnection();
    if (!isConnected) {
        return;
    }

    await publisherInstance?.publish(
        SYNC_REDIS_CHANNEL,
        JSON.stringify({ data, type }),
    );
}

function checkRedisConnection(): boolean {
    if (!publisherInstance) {
        logger.warn('Cannot establish sync, due to lost redis connection');
        return false;
    }

    return true;
}

export { publisherInstance, lockInstance };
