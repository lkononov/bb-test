export enum MessageTypes {
    SYNC = 'SYNC',
}

export type MessagePayload = {
    data: object;
    type: MessageTypes;
};
