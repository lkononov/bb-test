import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export default function withValidation(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        res.status(StatusCodes.BAD_REQUEST).json(validationErrors.mapped());
        return;
    }

    req.body = matchedData(req);
    next();
}
