import { type Request, type Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import datastore from '../../providers/datastore';
import { publishMessage } from '../../providers/redis';
import RollerCoaster from '../../structures/RollerCoaster';

import { DirByType } from '../../types/datastore';
import { MessageTypes } from '../../types/redis';
import { type IRollerCoaster } from '../../types/rollerCoaster';

export default async function updateRollerCoaster(req: Request, res: Response) {
    const loadedData = datastore.readFromFile<IRollerCoaster>(
        DirByType.ROLLERCOASTER,
        req.params.coasterId,
    );
    if (!loadedData) {
        res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
        return;
    }

    const rollerCoasterData = new RollerCoaster(loadedData);
    const { godziny_od, godziny_do, liczba_personelu, liczba_klientow } =
        req.body;
    const result = await rollerCoasterData.update({
        openedFrom: godziny_od,
        closedFrom: godziny_do,
        personnelCount: liczba_personelu,
        clientsCount: liczba_klientow,
    });

    if (result) {
        res.status(StatusCodes.OK).send(ReasonPhrases.OK);

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
