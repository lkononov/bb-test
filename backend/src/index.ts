import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import withLogger from './middlewares/withLogger';
import mainNodeService from './providers/mainNodeService';
import monitoringService from './providers/monitoringService';
import logger, { initLoggerFilesystem } from './providers/logger';
import { initPublisher, initSubscriber, initLock } from './providers/redis';
import { initDatastoreFilesystem } from './providers/datastore';

import router from './router';

const PORT = process.env.PORT;
const app = express();

initLoggerFilesystem();
initDatastoreFilesystem();

(async () => {
    await Promise.all([initPublisher(), initSubscriber(), initLock()]);
    await mainNodeService.init();
    await monitoringService.init();

    app.use(cors());
    app.use(withLogger);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(router);
    app.use((_req: Request, res: Response) => {
        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
    });
    app.use((_err: Error, _req: Request, res: Response) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            ReasonPhrases.INTERNAL_SERVER_ERROR,
        );
    });

    process.on('SIGINT', mainNodeService.releaseLock);
    process.on('SIGTERM', mainNodeService.releaseLock);

    app.listen(PORT, () => {
        return logger.info(`Application listening at port: ${PORT}`);
    });
})();
