import { type IWagon } from './wagon';

export interface IRollerCoaster {
    id: string;
    routeLength: number;
    openedFrom: string;
    closedFrom: string;
    personnelCount: number;
    requiredPersonnel?: number;
    clientsCount: number;
    wagons: IWagon[] | [];
}
