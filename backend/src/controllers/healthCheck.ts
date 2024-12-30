import express from 'express';

import { type Request, type Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

const router = express.Router();

router.get('/', (_: Request, res: Response) => {
    res.status(StatusCodes.OK).send(ReasonPhrases.OK);
});

export default router;
