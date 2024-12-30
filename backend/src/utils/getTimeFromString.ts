export default function getTimeFromString(time: string): number {
    const [houre, minutes] = time.split(':').map(Number);

    return houre * 60 + minutes;
}
