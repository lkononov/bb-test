import { NextFunction, Request, Response } from 'express';

import logger from '../providers/logger';

export default function withLogger(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    res.on('finish', () => {
        const requestLog = `${req.method} ${req.originalUrl} ${res.statusCode}`;

        if (res.statusCode >= 500) {
            logger.error(requestLog);
        } else {
            logger.info(requestLog);
        }
    });

    next();
}
