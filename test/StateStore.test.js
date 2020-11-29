import Vue from 'vue';
import Vuex from 'vuex';
import StateStore from '../src/js/StateStore.js';

Vue.use(Vuex)

const store = new Vuex.Store(StateStore);

describe('StateStore.js:mutations', () => {

    test('onLoad sets state.isPageLoaded to true', () => {
        store.commit('onLoad');
        expect(store.state.isPageLoaded).toBeTruthy();
    });

    test('log appends message to state.session.logs', () => {
        let message = 'jest test';
        store.commit('log', message);
        expect(store.state.session.logs[0]).toContain(message);
    });

    test('setSetupErrors sets state.setupErrors', () => {
        store.commit('setSetupErrors', [['generic', 'setup error']]);
        expect(store.state.setupErrors.length).toBe(1)
    })

    test('dismisSetupErrors sets state.setupErrors to null', () => {
        store.commit('dismisSetupErrors');
        expect(store.state.setupErrors).toBeNull();
    })

    test('connected sets state.session.websocket[service].isConnected to true', () => {
        store.commit('connected', 'daemon'); // daemon
        store.commit('connected', 'node'); // node

        expect(store.state.session.websocket['daemon'].isConnected).toBeTruthy(); // daemon
        expect(store.state.session.websocket['node'].isConnected).toBeTruthy(); // node
    })

    test('disconnected sets state.session.websocket[service].isConnected to false', () => {
        store.commit('disconnected', 'daemon'); // daemon
        store.commit('disconnected', 'node'); // node

        expect(store.state.session.websocket['daemon'].isConnected).toBeFalsy(); // daemon
        expect(store.state.session.websocket['node'].isConnected).toBeFalsy(); // node
    })

    test('updateNodePort sets state.session.websocket.node.port', () => {
        store.commit('updateNodePort', 1234);
        expect(store.state.session.websocket.node.port).toBe(1234);
    })

    test('updateDescriptor sets state.node.descriptor', () => {
        let descriptor = 'test:255.255.255.255:1234';
        store.commit('updateDescriptor', descriptor);
        expect(store.state.node.descriptor).toBe(descriptor);
    })
    
    test('appendFinancials appends financials', () => {
        let fins = {
            time: + new Date(),
            credit: 1.0,
            debt: 0.5,
        }

        store.commit('appendFinancials', fins);
        expect(store.state.session.financials.timesPolled.slice(-1)[0]).toBe(fins.time);
        expect(store.state.session.financials.credit.slice(-1)[0]).toBe(fins.credit);
        expect(store.state.session.financials.debt.slice(-1)[0]).toBe(fins.debt);
    })

    test('updateStartingStatus sets state.isNodeStarting boolean value', () => {
        // true
        store.commit('updateStartingStatus', true);
        expect(store.state.isNodeStarting).toBeTruthy();
        // false
        store.commit('updateStartingStatus', false);
        expect(store.state.isNodeStarting).toBeFalsy();
    })
    
    test('updateRunningStatus sets state.isNodeRunning and ensures state.isNodeStarting is false', () => {
        // true
        store.commit('updateRunningStatus', true);
        expect(store.state.isNodeRunning).toBeTruthy();
        // false
        store.commit('updateRunningStatus', false);
        expect(store.state.isNodeRunning).toBeFalsy();
        // state.isNodeStarting is false
        expect(store.state.isNodeStarting).toBeFalsy();
    })
    
    test('setFinancialsInterval sets state.session.financialsInterval with output of setInterval()', () => {
        store.commit('setFinancialsInterval', 84);
        expect(store.state.session.financialsInterval).toBe(84);
    })
    
    test('setFinancialBalances sets state.session.financials.* (masq and eth balances)', () => {
        let balances = {
            masq: 420,
            eth: 69
        }
        store.commit('setFinancialBalances', balances);
        expect(store.state.session.financials.ethBalance).toBe(69);
        expect(store.state.session.financials.masqBalance).toBe(420);
    })
    
    test('updateNodeSetup sets state.node.setup (masq setup values)', () => {
        let setup = {
            'chain': {
                name: 'chain',
                value: 'mainnet',
                status: 'Default'
            }
        }
        store.commit('updateNodeSetup', setup);
        expect(store.state.node.setup.chain.value).toBe(setup.chain.value);
    })
    
    test('updateSetupProperty sets value for given setup value in state.node.setup[*]', () => {
        let payload = { name: 'chain', value: 'testnet' }
        store.commit('updateSetupProperty', payload);
        expect(store.state.node.setup[payload.name].value).toBe(payload.value);
    })
    
    test('replaceSettings sets state.settings (usually from localStorage)', () => {
        let payload = { jest: true }
        store.commit('replaceSettings', payload);
        expect(store.state.settings.jest).toBeTruthy();
    })
    
    test('updateSettings sets value of specified property in state.settings', () => {
        let payload = { name: 'jest', value: false }
        store.commit('updateSettings', payload);
        expect(store.state.settings[payload.name]).toBe(payload.value);
    })
    
    test('toggleAssistantBody toggles boolean value for state.session.assistant.showBody', () => {
        let before;
        let after;

        before = store.state.session.assistant.showBody;
        store.commit('toggleAssistantBody');
        expect(store.state.session.assistant.showBody).toBe(!before);

        after = store.state.session.assistant.showBody;
        store.commit('toggleAssistantBody');
        expect(store.state.session.assistant.showBody).toBe(!after);
    })
    
    test('showAssistantBody sets state.session.assistant.showBody to true', () => {
        store.commit('showAssistantBody');
        expect(store.state.session.assistant.showBody).toBeTruthy();
    })
    
    test('appendAssistantMessage appends message to state.session.assistant.messages', () => {
        let message = { from: 'masq', text: 'jest is the way' }
        store.commit('appendAssistantMessage', message);
        expect(store.state.session.assistant.messages.length).toBe(1);
        expect(store.state.session.assistant.messages[0].hasOwnProperty('id')).toBeTruthy();
        expect(store.state.session.assistant.messages[0].hasOwnProperty('time')).toBeTruthy();
        expect(store.state.session.assistant.messages[0].from).toEqual(message.from);
        expect(store.state.session.assistant.messages[0].text).toEqual(message.text);
    })
    
    test('replaceAssistantUserResponses sets state.session.assistant.availUserResponses with available user responses', () => {
        let respOptions = [
            { value: 'yes', text: 'Yes', callback: () => {} },
            { value: false, text: 'No', callback: () => {} },
        ];
        store.commit('replaceAssistantUserResponses', respOptions);
        expect(store.state.session.assistant.availUserResponses[0].value).toBe('yes');
        expect(store.state.session.assistant.availUserResponses[1].value).toBeFalsy();
        expect(typeof store.state.session.assistant.availUserResponses[1].callback).toBe('function');
        expect(typeof store.state.session.assistant.availUserResponses[1].callback).toBe('function');
    })
    
    test('archiveAssistantMessages moves active messages in state.session.assistant.messages to state.session.assistant.messageArchive', () => {
        store.commit('archiveAssistantMessages');
        expect(store.state.session.assistant.messageArchive[0].text).toBe(store.state.session.assistant.messages[0].text);
    })

    // this test going after appendAssistanceMessage and archineAssistanceMessages have been tested (need existing message for archive...)
    test('clearAssistantMessages sets state.session.assistant.messages to empty array (clears)', () => {
        store.commit('clearAssistantMessages');
        expect(store.state.session.assistant.messages.length).toBe(0);
    })
    

})

describe('StateStore.js:getters', () => {
    test('anyConnection has correct logic', () => {
        // false false
        store.commit('disconnected', 'daemon'); // daemon
        store.commit('disconnected', 'node'); // node
        expect(store.getters.anyConnection).toBeFalsy()

        // true false
        store.commit('connected', 'daemon'); // daemon
        expect(store.getters.anyConnection).toBeTruthy()

        // RESET
        // false false
        store.commit('disconnected', 'daemon'); // daemon
        store.commit('disconnected', 'node'); // node
        expect(store.getters.anyConnection).toBeFalsy()

        // false true
        store.commit('connected', 'node'); // daemon
        expect(store.getters.anyConnection).toBeTruthy()
    })

    test('targetConnection returns proper string for multiple conditions', () => {
        // node connection false
        store.commit('disconnected', 'node'); // node
        expect(store.getters.targetConnection).toEqual(`daemon:${store.state.settings.daemonPort}`);

        // node connection true
        store.commit('connected', 'node'); // node
        expect(store.getters.targetConnection).toEqual(`node:${store.state.session.websocket.node.port}`);
    })

    test('debt returns latest debt value', () => {
        let fins = {
            time: + new Date,
            credit: 0,
            debt: Math.random()
        }
        store.commit('appendFinancials', fins);
        expect(store.getters.debt).toBe(fins.debt)
    })

    test('credit returns latest credit value', () => {
        let fins = {
            time: + new Date,
            credit: Math.random(),
            debt: 0
        }
        store.commit('appendFinancials', fins);
        expect(store.getters.credit).toBe(fins.credit)
    })
})