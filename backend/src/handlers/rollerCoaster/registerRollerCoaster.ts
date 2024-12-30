import crypto from 'crypto';
import { type Request, type Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { publishMessage } from '../../providers/redis';
import RollerCoaster from '../../structures/RollerCoaster';

import { MessageTypes } from '../../types/redis';

export default async function registerRollerCoaster(
    req: Request,
    res: Response,
) {
    const rollerCoaster = new RollerCoaster({
        id: crypto.randomUUID(),
        routeLength: req.body.dl_trasy,
        openedFrom: req.body.godziny_od,
        closedFrom: req.body.godziny_do,
        personnelCount: req.body.liczba_personelu,
        clientsCount: req.body.liczba_klientow,
        wagons: [],
    });

    const result = await rollerCoaster.save();
    if (result) {
        res.status(StatusCodes.CREATED).send({ id: rollerCoaster.id });

        publishMessage({
            data: rollerCoaster,
            type: MessageTypes.SYNC,
        });

        return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
        ReasonPhrases.INTERNAL_SERVER_ERROR,
    );
}
