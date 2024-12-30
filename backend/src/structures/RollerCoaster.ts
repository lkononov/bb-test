import datastore from '../providers/datastore';
import getTimeFromString from '../utils/getTimeFromString';

import { type IRollerCoaster } from '../types/rollerCoaster';
import { type IWagon } from '../types/wagon';
import { DirByType } from '../types/datastore';

const PERSONNEL_PER_WAGON = 2;
const PERSONNEL_PER_ROLLERCOASTER = 1;
const WAGON_RIDE_DELAY_SEC = 5 * 60;

class RollerCoaster implements IRollerCoaster {
    id: IRollerCoaster['id'];
    routeLength: IRollerCoaster['routeLength'];
    openedFrom: IRollerCoaster['openedFrom'];
    closedFrom: IRollerCoaster['closedFrom'];
    personnelCount: IRollerCoaster['personnelCount'];
    requiredPersonnel: IRollerCoaster['requiredPersonnel'];
    clientsCount: IRollerCoaster['clientsCount'];
    wagons: IRollerCoaster['wagons'];

    constructor(rollercoaster: IRollerCoaster) {
        this.id = rollercoaster.id;
        this.routeLength = rollercoaster.routeLength;
        this.openedFrom = rollercoaster.openedFrom;
        this.closedFrom = rollercoaster.closedFrom;
        this.personnelCount = rollercoaster.personnelCount;
        this.clientsCount = rollercoaster.clientsCount;
        this.wagons = rollercoaster.wagons;
        this.requiredPersonnel =
            PERSONNEL_PER_ROLLERCOASTER +
            this.wagons.length * PERSONNEL_PER_WAGON;
    }

    async save(): Promise<boolean> {
        return datastore.saveToFile(DirByType.ROLLERCOASTER, this);
    }

    async update(
        data: Pick<
            IRollerCoaster,
            'openedFrom' | 'closedFrom' | 'personnelCount' | 'clientsCount'
        >,
    ) {
        this.openedFrom = data.openedFrom;
        this.closedFrom = data.closedFrom;
        this.personnelCount = data.personnelCount;
        this.clientsCount = data.clientsCount;

        return this.save();
    }

    async addWagon(wagon: IWagon): Promise<boolean> {
        this.wagons = [...(this.wagons || []), wagon];
        this.setRequiredPersonnelCount();
        return this.save();
    }

    async deleteWagon(wagonId: string): Promise<boolean> {
        if (!this.wagons?.length) {
            return true;
        }

        this.wagons = this.wagons.filter((wagon) => wagon.id !== wagonId);
        this.setRequiredPersonnelCount();
        return this.save();
    }

    setRequiredPersonnelCount() {
        this.requiredPersonnel =
            PERSONNEL_PER_ROLLERCOASTER +
            this.wagons.length * PERSONNEL_PER_WAGON;
    }

    getWarningMessage(): string | null {
        const warnings: string[] = [];

        const personnelWarning = this.getPersonelWarning();
        if (personnelWarning) {
            warnings.push(personnelWarning);
        }

        const wagonCapacityWarning = this.getWagonCapacityWarning();
        if (wagonCapacityWarning) {
            warnings.push(wagonCapacityWarning);
        }

        if (!warnings.length) {
            return null;
        }

        return warnings.join('. ');
    }

    getPersonelWarning(): string | null {
        const personnelDifference =
            this.personnelCount - (this.requiredPersonnel || 0);

        if (personnelDifference < 0) {
            return `Brakuje personelu: ${personnelDifference * -1}`;
        } else if (personnelDifference > 0) {
            return `Za dużo personelu o: ${personnelDifference}`;
        }

        return null;
    }

    getWagonCapacityWarning(): string | null {
        const workingTimeSec =
            (getTimeFromString(this.closedFrom) -
                getTimeFromString(this.openedFrom)) *
            60;

        let rollerCoasterCapacity = 0;
        this.wagons.forEach((wagon) => {
            const oneRideTime =
                Math.floor(this.routeLength / wagon.speed) +
                WAGON_RIDE_DELAY_SEC;

            const maxRides = Math.floor(workingTimeSec / oneRideTime);
            const wagonCapacity = maxRides * wagon.seatsCount;

            rollerCoasterCapacity += wagonCapacity;
        });

        if (rollerCoasterCapacity < this.clientsCount) {
            return `Brakuje ${this.clientsCount - rollerCoasterCapacity} miejsc w wagonach`;
        }

        if (rollerCoasterCapacity / this.clientsCount >= 2) {
            return `Za dużo przydzielonych wagonów oraz personelu, kolejka jest w stanie obsłużyć ponad dwukrotną ilość klientów`;
        }

        return null;
    }
}

export default RollerCoaster;
