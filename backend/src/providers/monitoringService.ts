import mainNodeService from './mainNodeService';
import datastore from './datastore';
import logger from './logger';
import RollerCoaster from '../structures/RollerCoaster';

import { DirByType } from '../types/datastore';
import { type IRollerCoaster } from '../types/rollerCoaster';

class MonitoringService {
    rollerCoasters: IRollerCoaster[] = [];

    async init() {
        setInterval(async () => {
            if (!mainNodeService.isMainNode()) {
                return;
            }

            this.rollerCoasters = datastore.readFromDir<IRollerCoaster>(
                DirByType.ROLLERCOASTER,
            );

            this.calculateMonitoringData();
        }, 1000);
    }

    calculateMonitoringData() {
        const logs: string[] = [];
        let shouldWarn: boolean = false;

        this.rollerCoasters.forEach((rollerCoaster) => {
            const thisRollerCoaster = new RollerCoaster(rollerCoaster);
            const rollerCoasterWarning = thisRollerCoaster.getWarningMessage();

            let status = 'Status: OK';
            if (rollerCoasterWarning) {
                status = `Problem: ${rollerCoasterWarning}`;
                shouldWarn = true;
            }

            const monitoringMessage = [
                `[Kolejka: ${thisRollerCoaster.id}]`,
                `\t Godziny działania: ${thisRollerCoaster.openedFrom} - ${thisRollerCoaster.closedFrom}`,
                `\t Liczba wagonów: ${thisRollerCoaster.wagons.length}/${thisRollerCoaster.wagons.length}`,
                `\t Dostępny personel: ${thisRollerCoaster.personnelCount}/${thisRollerCoaster.requiredPersonnel}`,
                `\t Klienci dziennie: ${thisRollerCoaster.clientsCount}`,
                `\t ${status}`,
            ].join('\n');

            logs.push(monitoringMessage);
        });

        if (!logs.length) {
            logs.push('Nie zarejestrowano żadnej kolejki.');
        }

        const time = new Date()
            .toLocaleString('pl-PL', {
                timeZone: 'Europe/Warsaw',
            })
            .split(', ')[1];

        const messageString = [' ', `[Godzina ${time}]`, ...logs, '\n'].join(
            '\n',
        );

        if (shouldWarn) {
            logger.warn(messageString);
            return;
        }

        logger.info(messageString);
    }
}

const monitoringService = new MonitoringService();

export default monitoringService;
