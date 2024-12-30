import express from 'express';

import {
    registerValidations,
    updateValidations,
    registerWagonValidations,
    deleteWagonValidations,
} from '../validatorChaines/rollerCoaster';
import withValidation from '../middlewares/withValidation';

import registerRollerCoaster from '../handlers/rollerCoaster/registerRollerCoaster';
import updateRollerCoaster from '../handlers/rollerCoaster/updateRollerCoaster';
import registerRollerCoasterWagon from '../handlers/rollerCoaster/registerRollerCoasterWagon';
import deleteRollerCoasterWagon from '../handlers/rollerCoaster/deleteRollerCoasterWagon';

const router = express.Router();

router.post('/', ...registerValidations, withValidation, registerRollerCoaster);
router.put(
    '/:coasterId',
    ...updateValidations,
    withValidation,
    updateRollerCoaster,
);
router.post(
    '/:coasterId/wagons',
    ...registerWagonValidations,
    withValidation,
    registerRollerCoasterWagon,
);
router.delete(
    '/:coasterId/wagons/:wagonId',
    ...deleteWagonValidations,
    withValidation,
    deleteRollerCoasterWagon,
);

export default router;
