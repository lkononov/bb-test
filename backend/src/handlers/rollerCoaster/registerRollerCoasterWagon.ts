import crypto from 'crypto';
import { type Request, type Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import datastore from '../../providers/datastore';
import { publishMessage } from '../../providers/redis';
import RollerCoaster from '../../structures/RollerCoaster';
import Wagon from '../../structures/Wagon';

import { DirByType } from '../../types/datastore';
import { MessageTypes } from '../../types/redis';
import { type IRollerCoaster } from '../../types/rollerCoaster';

export default async function registerRollerCoasterWagon(
    req: Request,
    res: Response,
) {
    const loadedData = datastore.readFromFile<IRollerCoaster>(
        DirByType.ROLLERCOASTER,
        req.params.coasterId,
    );
    if (!loadedData) {
        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
    }

    const rollerCoasterData = new RollerCoaster(loadedData);
    const wagonData = new Wagon({
        id: crypto.randomUUID(),
        speed: req.body.predkosc_wagonu,
        seatsCount: req.body.ilosc_miejsc,
    });

    const result = await rollerCoasterData.addWagon(wagonData);
    if (result) {
        res.status(StatusCodes.OK).send({ id: wagonData.id });

        publishMessage({
            data: rollerCoasterData,
            type: MessageTypes.SYNC,
        });

        return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
        ReasonPhrases.INTERNAL_SERVER_ERROR,
    );
}
