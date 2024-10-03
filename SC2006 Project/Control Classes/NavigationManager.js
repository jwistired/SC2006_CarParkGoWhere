export class NavigationManager {
    constructor() {
        this.currentLocation = '';
        this.destination = '';
    }

    navigateTo(destination) {
        this.destination = destination;
        console.log(`Navigating to: ${destination}`);
    }

    getCurrentLocation() {
        return this.currentLocation;
    }
}
