export class Storage {
    constructor() {

    }

    set(key, value) {
        console.log('Storage.js:set', `setting '${key}'`);
        localStorage.setItem(key, JSON.stringify(value));
    }

    get(key, defaultValue = null) {
        console.log('Storage.js:get', `getting '${key}'`);
        let value = localStorage.getItem(key);
        if(!value) {
            // no value in storage
            return defaultValue;
        }
        return JSON.parse(value);
    }
}