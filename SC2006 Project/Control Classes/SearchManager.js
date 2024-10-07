export class SearchManager {
    constructor() {
        this.searchCriteria = '';
    }

    performSearch(criteria) {
        this.searchCriteria = criteria;
        console.log(`Searching for car parks using: ${criteria}`);
    }

    clearSearch() {
        this.searchCriteria = '';
        console.log("Search cleared");
    }
}
