let triedDescriptors = [];

export class Utils {
    constructor() {

    }

    /**
     * Converts array of setup values to dictionary.
     * @param {Array} values payload.values response from masq 'setup'
     * @param {Array} nullifyDefaultsFor setup keys that should be null if default (largely to handle default 'config.toml')
     */
    static setupValuesToDict(values, nullifyDefaultsFor = []) {
        let dict = {};

        values.forEach((x, i) => {
            dict[x.name] = x; //nullifyDefaultsFor.includes(x.name) && x.status == 'Default' ? null : x.value;
        });

        return dict;
    }

    /**
     * Convert setup values dictionary to array for masq.
     * @param {Object} dict setup values dictionary
     */
    static dictToSetupValues(dict, unsyncedFilter) {
        let values = [];

        Object.keys(dict).forEach((key) => {
            values.push({
                name: key,
                value: dict[key].value && dict[key].value.length > 0 ? dict[key].value : null
            });
        });

        // filter unchanged values (if requested)
        values = Utils.filterUnchangedSetupValues(values, dict, unsyncedFilter);

        return values;
    }

    /**
     * Compare two setup values dictionaries.
     * @param {Object} a setup values dict
     * @param {Object} b setup values dict
     * @returns {Boolean} true if same, or false if different
     */
    static compareSetupDicts(a, b) {
        let unsynced = [];
        let aKeys = Object.keys(a);
        /*if(aKeys.length !== Object.keys(b).length) {
            console.log('utils.js:compareSetupDicts', `${aKeys.length} != ${Object.keys(b).length}`)
            return false; // key lengths don't match
        }*/

        for(let i = 0; i < aKeys.length; i++) {
            if(!b.hasOwnProperty(aKeys[i]) || b[aKeys[i]].value != a[aKeys[i]].value) {
                console.log('utils.js:compareSetupDicts', `${b[aKeys[i]].value} != ${a[aKeys[i]].value}`)
                //return false;
                unsynced.push(aKeys[i]);
            }
        }

        console.log('UNSYNCED', unsynced);

        return unsynced;
    }

    static filterUnchangedSetupValues(values, dict, unsyncedFilter) {
        let results = [];

        values.forEach(val => {
            // values updated should have 'Set' status (even 'required' ones that have changed)
            if(unsyncedFilter.includes(val.name)) { // && val.name != 'neighborhood-mode'   (dict[val.name].hasOwnProperty('isChanged') && dict[val.name].isChanged) || 
                results.push(val);
            }
        });
        return results;
    }

    /**
     * Shuffle an array in place.
     * Credit: https://stackoverflow.com/a/6274381
     * @param {Array} a 
     */
    static shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /**
     * Automatically prompt user to download text file
     * Credit: https://stackoverflow.com/a/18197341 (adapted for JSON)
     * @param {String} filename 
     * @param {String} text 
     */
    static downloadJSON(filename, json) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(json));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    /**
     * Get current IP address of machine.
     * @returns {String} client IP address
     */
    static async getCurrentIP() {
        try {
            let resp = await fetch('https://api4.my-ip.io/ip.json');
            let data = await resp.json();
            return data.ip;
        } catch(error) {
            console.error(`Failed to get IP (${error})`)
            return false;
        }
    }

    /**
     * Get publicly shared node descriptors from nodes.masq.ai
     */
    static async getPublicDescriptor(isMainnet = false) {
        let data;
        try {
            let resp = await fetch('https://nodes.masq.ai/api/v0/nodes');
            data = await resp.json()
        } catch(error) {
            console.error(`Failed to get node descriptors from nodes.masq.ai`);
            return false;
        }

        // data length check
        if(data.length === 0) {
            console.error('No public node descriptors available');
            return false;
        }

        // reset cache if max cycled
        if(data.filter(d => d.mainnet === isMainnet).length === triedDescriptors.length) triedDescriptors = [];

        for(let i = 0; i < data.length; i++) {
            if(data[i].mainnet === isMainnet && !triedDescriptors.includes(data[i].descriptor)) {
                triedDescriptors.push(data[i].descriptor);
                return data[i].descriptor;
                break;
            }
        }
    }

}