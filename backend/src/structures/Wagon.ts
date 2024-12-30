import { type IWagon } from '../types/wagon';

class Wagon implements IWagon {
    id: IWagon['id'];
    speed: IWagon['speed'];
    seatsCount: IWagon['seatsCount'];

    constructor(wagon: IWagon) {
        this.id = wagon.id;
        this.speed = wagon.speed;
        this.seatsCount = wagon.seatsCount;
    }
}

export default Wagon;
