export class UserManager {
    constructor(userType, parkingHistory) {
        this.userType = userType;
        this.parkingHistory = parkingHistory;
        this.mapSettings = '';
        this.savedCarparks = [];
        this.filters = '';
        this.sortOption = '';
    }

    updateParkingHistory(newHistory) {
        this.parkingHistory = newHistory;
    }

    getParkingHistory() {
        return this.parkingHistory;
    }

    switchMapSettings(newSettings) {
        this.mapSettings = newSettings;
    }

    applyFilters(newFilters) {
        this.filters = newFilters;
    }

    sortCarparks(option) {
        this.sortOption = option;
    }

    getUserType() {
        return this.userType;
    }
}
