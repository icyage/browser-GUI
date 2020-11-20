import { Messenger } from './Messenger.js';
import { Utils } from './utils.js';
import { Storage } from './Storage.js';
import BalanceProviders from './BalanceProviders.js';

export class Controller {
    constructor() {
        this._store = null; // set in plugin()
        this._messenger = new Messenger();
        this._balanceProviders = new BalanceProviders();

        this.storage = new Storage();
        this._financialsInterval = null;

        this._log = []; // running session log

        // init listeners
        // general
        this._messenger.on('open', this.onOpen.bind(this));
        this._messenger.on('close', this.onClose.bind(this));
        this._messenger.on('error', this.onError.bind(this));

        // MASQ specific
        this._messenger.on('crash', this.onCrash.bind(this));
        this._messenger.on('financials', this.onFinancials.bind(this));
        this._messenger.on('redirect', this.onRedirect.bind(this));
        this._messenger.on('setup', this.onSetup.bind(this));
        this._messenger.on('shutdown', this.onShutdown.bind(this));
        this._messenger.on('start', this.onStart.bind(this));
        this._messenger.on('onUnmarshalError', this.onUnmarshalError.bind(this));
        this._messenger.on('descriptor', this.onDescriptor.bind(this));

    }

    plugin(store) {
        let storedSettings;
        console.log('Controller.js:plugin', 'called');

        this._store = store; // expose store to all of controller

        // replace settings with localStorage settings (if any)
        if(storedSettings = this.storage.get('settings', false)) {
            // settings found in storage
            store.commit('replaceSettings', storedSettings);
        }

        // initial websocket connection (now that settings are ?updated)
        this._messenger.connect(store.state.settings.daemonPort);

        store.subscribe(mutation => {
            console.log('Controller.js:plugin (subscriber)', mutation.type);
            
            switch(mutation.type) {
                // Settings
                case 'updateSettings':
                case 'replaceSettings':
                    this.storage.set('settings', this._store.state.settings);
                break;

                // Node Running Status
                case 'updateRunningStatus':
                    if(store.state.isNodeRunning) {
                        this._financialsInterval = setInterval(() => {
                            this.requestFinancials(); // you can make this one line
                        }, 2000);
                    } else {
                        // clear financials interval
                        clearInterval(this._financialsInterval);
                    }
                break;
                
                // setup changes (auto sync)
                case 'updateSetupProperty':
                    this.syncSetup([mutation.payload.name]);
                    store.commit('log', `'${mutation.payload.name}' setup value updated to '${mutation.payload.value}'`);
                break;

                // pageloaded


            }
        });
    }

    log(msg) {
        this._log.push(`${new Date().toISOString()}: ${msg}`);
    }

    getLog() {
        return this._log;
    }

    /**
     * Called from redirect payload (opcodes: 'start', 'setup')
     * @param {Number} port WebSocker port for new target
     */
    changePort(port) {
        this._messenger.connect(port);
    }

    updateConnectionStatuses(port, isOpened) {
        // determine what service UI is connected to
        let connectionType;
        //let connectedPort = this._messenger.getPort();
        let actionModifier = isOpened ? 'connected to' : 'disconnected from';

        console.log('?', port, ' == ', this._store.state.settings.daemonPort)

        if(port == this._store.state.settings.daemonPort) {
            // connected to daemon
            connectionType = 'daemon';
            this._messenger.send('blah', { values: [] }); // send empty Unknown opcode, 'blah', (essentially a request for a redirect to node port if running)
            this._store.commit(isOpened ? 'connected' : 'disconnected', 'daemon');
            //this._store.commit(!isOpened ? 'connected' : 'disconnected', 'node');
        } else {
            // connected to node
            connectionType = 'node';
            this._store.commit('updateStartingStatus', false);
            this._store.commit('updateRunningStatus', isOpened);
            this._store.commit('updateNodePort', port);
            this._store.commit(isOpened ? 'connected' : 'disconnected', 'node');
            //this._store.commit(!isOpened ? 'connected' : 'disconnected', 'daemon');
            if(isOpened) {
                this._messenger.send('descriptor', {}); // request node descriptor
                this._messenger.send('blah', { values: [] });
            }
        }

        this._store.commit('log', `WebSocket ${actionModifier} ${connectionType} on port ${port}`);
        this._store.$app.createToast(isOpened ? 'success' : 'warning', `${actionModifier} ${connectionType}`);
    }

    // general 
    onOpen(e) {
        console.log('Open');

        let openedPort = new URL(e.target.url).port;

        this._messenger.send("setup", { values: [] });

        this.updateConnectionStatuses(openedPort, true);
    }

    onClose(e) {
        console.log('Close');

        let closedPort = new URL(e.target.url).port;

        this.updateConnectionStatuses(closedPort, false);
    }

    onError() {
        console.log('Error');
        this.log(`WebSocket couldn't connect to ${this._messenger.getPort()}`);
        this._store.$app.createToast('danger', `Can't connect to websocket (${this._messenger.getPort()})`);
    }

    // MASQ specific listeners

    onCrash(payload) {
        console.log('CRASH');
        this.log(`CRASH: ${JSON.stringify(payload.crashReason)}`);
    }

    onFinancials(payload) {
        this._store.commit('appendFinancials', {
            time: + new Date(),
            credit: payload.totalReceivable / 1000000000000000000,
            debt: payload.totalPayable / 1000000000000000000
        });
        
    }

    onDescriptor(payload) {
        this._store.commit('updateDescriptor', payload.nodeDescriptor);
    }

    onRedirect(payload) {
        // redirect may have null payload
        console.log('redirect');
        if(!payload) return;
        this.changePort(payload.port);
    }

    onSetup(payload) {
        console.log('setup');
        this.log(`Setup values received`);

        try {
            // skip if values are empty, silently exclude
            if(payload.values.length > 0) {
                let setupDict = Utils.setupValuesToDict(payload.values, ['config-file']);
                this._store.commit('updateNodeSetup', setupDict);

                // define wallet set status
                let earningWalletObj = payload.values.find(el => el.name == 'earning-wallet');
                this._store.commit('setWalletSetStatus', earningWalletObj.status == 'Set');

                console.log(payload.values);
            }

            this._store.commit('updateRunningStatus', payload.running);
        } catch (error) {
            console.error(error);
            this.log(`Error parsing setup values.`);
        }

        // store errors (or empty array)
        this._store.commit('setSetupErrors', payload.errors);
    }

    onShutdown() {
        console.log('shutdown');
    }

    onStart(payload, error) {
        console.log('start');
        //this._store.commit('updateStartingStatus', false);

        if(error) {
            
            this._store.commit('updateRunningStatus', false);
            this.log(`Start node failed (Error: ${error.message})`);
            this._store.$app.createToast('warning', error.message);
            return;
        } else {
            // start successfull
            this.changePort(payload.redirectUiPort);
        }
    }

    onUnmarshalError() {
        console.log('unmarshalError');
    }

    // MASQ commands / helpers

    requestFinancials() {
        console.log('Controller.js:requestFinancial', 'requesting...');
        // Start: MOCK
        /*
        let payload = {
            totalReceivable: this._store.getters.credit + Math.random() * 0.05,
            totalPayable: this._store.getters.debt + Math.random() * 0.06
        }

        this.onFinancials(payload);
        */
        // End: Mock

        this._messenger.send('financials', {
            "payableMinimumAmount": 1,
            "payableMaximumAge": 10000000000000,
            "receivableMinimumAmount": 1,
            "receivableMaximumAge": 1000000000000
        });
    }

    syncSetup(unsyncedFilter = []) {
        let tmp = {...this._store.state.node.setup};

        /*if(!syncPrivateKey) {
            // remove private key because it is a placeholder from the masq
            delete tmp['consuming-private-key'];
            delete tmp['db-password'];
        }*/

        //console.log('Controller.js:syncSetup', 'syncing...', tmp);
        let values = Utils.dictToSetupValues(tmp, unsyncedFilter);
        console.log('syncSetup:values', values);

        this._messenger.send('setup', {
            values: values
        });

        
    }

    configureModeSetup(mode) {
        console.log(mode);
    }

    start() {
        this._messenger.send('start');
        this.log(`Attempting to start node`);
        this._store.commit('updateStartingStatus', true);
    }

    shutdown() {
        this._messenger.send('shutdown');
        this.log(`Attempting to shutdown node`);

        // Currently no good feedback on a shutdown node. TRY and reconnect to daemon
        if(this._daemonPort != this._messenger.getPort()) {
            // reconnect
            this.log(`Swiching back to daemon connection`);
            this._messenger.connect(this._daemonPort);
        }
    }

}