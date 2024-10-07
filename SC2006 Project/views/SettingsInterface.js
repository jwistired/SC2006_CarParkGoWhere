export class SettingsInterface {
    constructor() {
        this.languageSetting = '';
    }

    setLanguage(language) {
        this.languageSetting = language;
        console.log(`Language set to: ${language}`);
    }

    getLanguage() {
        return this.languageSetting;
    }
}
