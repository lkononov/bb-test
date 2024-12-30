import { body, param } from 'express-validator';
import getTimeFromString from '../utils/getTimeFromString';

const coasterId = param('coasterId')
    .isUUID('4')
    .withMessage('coasterId must be a valid UUID');
const wagonId = param('wagonId')
    .isUUID('4')
    .withMessage('wagonId must be a valid UUID');
const routeLength = body('dl_trasy')
    .isInt({ min: 0 })
    .withMessage('Route must be a number, can`t be negative');
const openedFrom = body('godziny_od')
    .isString()
    .withMessage('openedFrom must be a string of type HH:MM')
    .custom((value, { req }) => houreValidator(value, req.body.godziny_do))
    .withMessage('openedFrom must be between 00:00 and 23:59');
const openedAfter = body('godziny_do')
    .isString()
    .withMessage('openedAfter must be a string of type HH:MM')
    .custom((value, { req }) => houreValidator(req.body.godziny_od, value))
    .withMessage('openedAfter must be between 00:00 and 23:59');
const personnelCount = body('liczba_personelu')
    .isInt({ min: 0 })
    .withMessage('personnelCount must be a number, can`t be negative');
const clientsCount = body('liczba_klientow')
    .isInt({ min: 0 })
    .withMessage('clientsCount must be a number, can`t be negative');
const seatsCount = body('ilosc_miejsc')
    .isInt({ min: 0 })
    .withMessage('ilosc_miejsc must be a number, can`t be negative');
const wagonSpeed = body('predkosc_wagonu')
    .isFloat({ min: 0 })
    .withMessage('predkosc_wagonu must be a number, can`t be negative');

const houreValidator = (from: string, to: string) => {
    try {
        const openedFrom = getTimeFromString(from);
        const closedFrom = getTimeFromString(to);
        if (openedFrom > closedFrom || closedFrom > 1439) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

export const registerValidations = [
    routeLength,
    openedFrom,
    openedAfter,
    personnelCount,
    clientsCount,
];
export const updateValidations = [
    coasterId,
    openedFrom,
    openedAfter,
    personnelCount,
    clientsCount,
];
export const registerWagonValidations = [coasterId, seatsCount, wagonSpeed];
export const deleteWagonValidations = [coasterId, wagonId];
