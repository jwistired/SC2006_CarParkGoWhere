export class MapInterface {
    checkLocation(currentLocation) {
        return `Location checked: ${currentLocation}`;
    }

    pinPoint(carParkLocation) {
        console.log(`Pinning car park location: ${carParkLocation}`);
    }
}
