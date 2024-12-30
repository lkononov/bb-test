import { type Lock } from 'redlock';

import logger from './logger';
import { lockInstance, publisherInstance } from './redis';

const LOCK_DURATION = 5000;
const LOCK_REFRESH_TIME = 3000;
const LOCK_RETRY_TIME = 2000;
const LOCK_KEY = `${process.env.ENV_NAME}:main-node`;

class MainNodeService {
    lock: Lock | null = null;
    extendLockInterval: NodeJS.Timeout | null = null;
    isMainSyncNode: boolean = false;

    async init(): Promise<void> {
        if (!lockInstance) {
            logger.warn('Cannot connect to redis lock instance, retrying...');
            setTimeout(mainNodeService.init, LOCK_RETRY_TIME);
        }

        try {
            this.lock = (await lockInstance?.acquire(
                [LOCK_KEY],
                LOCK_DURATION,
            )) as Lock;
            this.isMainSyncNode = true;
            logger.info('Instance defined as main sync node');

            this.extendLockInterval = setInterval(async () => {
                try {
                    if (this.lock) {
                        this.lock = await this.lock.extend(LOCK_DURATION);
                    }
                } catch {
                    logger.info('Cannot extend lock, reset main node');

                    if (this.extendLockInterval) {
                        clearInterval(this.extendLockInterval);
                    }

                    this.isMainSyncNode = false;
                    mainNodeService.init();
                }
            }, LOCK_REFRESH_TIME);
        } catch {
            logger.info('Retry to define main node');
            this.isMainSyncNode = false;
            setTimeout(mainNodeService.init, LOCK_RETRY_TIME);
        }
    }

    async releaseLock(): Promise<void> {
        if (this.isMainSyncNode && publisherInstance) {
            logger.info('Lock released before shutdown');
            await publisherInstance?.del(LOCK_KEY);
        }

        process.exit(0);
    }

    isMainNode(): boolean {
        return this.isMainSyncNode;
    }
}

const mainNodeService = new MainNodeService();

export default mainNodeService;
