import BalanceProviders from './BalanceProviders.js';
const balanceproviders = new BalanceProviders();

export default {
    state: {
        isPageLoaded: false, // page loaded status
        isNodeStarting: false,
        isNodeRunning: false, // could be different temporarily than its websocket connection status
        setupErrors: [], // from daemon 'setup' payload.errors
        session: {
            logs: [],
            websocket: {
                daemon: {
                    isConnected: false,
                },
                node: {
                    isConnected: false,
                    port: null, // variable to open ports
                }
            },
            financialsInterval: null,
            financials: {
                // blockchain balances (queried by GUI)
                ethBalance: null,
                masqBalance: null,
                // from masq node
                timesPolled: new Array(15).fill(0).map((x, i) => i),
                credit: new Array(15).fill(0),
                debt: new Array(15).fill(0)
            },
            assistant: {
                showBody: false,
                messages: [],
                messageArchive: [],
                availUserResponses: []
            }
        },
        // Persistent UI Settings
        settings: {
            lang: 'en',
            theme: 'dark',
            daemonPort: 5333,
            enableZeroHop: true,
            enableAssistant: true,
        },
        node: {
            descriptor: '(This version can\'t access Node Descriptor)',//'V2hlcmUgaXMgSnVzdGluIFRhYmIsICRTVUIgQ0VPPz8/:74.114.82.72:5386',
            walletSet: false,
            setup: {
                "blockchain-service-url": {
                    value: null,
                    status: 'Default'
                },
                "chain": {
                    value: null,
                    status: 'Default'
                },
                "clandestine-port": {
                    value: null,
                    status: 'Default'
                },
                "config-file": {
                    value: null,
                    status: 'Default'
                },
                "consuming-private-key": {
                    value: null,
                    status: 'Default'
                },
                "data-directory": {
                    value: null,
                    status: 'Default'
                },
                "db-password": {
                    value: null,
                    status: 'Default'
                },
                "dns-servers": {
                    value: null,
                    status: 'Default'
                },
                "earning-wallet": {
                    value: '',
                    status: 'Default'
                },
                "gas-price": {
                    value: null,
                    status: 'Default'
                },
                "ip": {
                    value: null,
                    status: 'Default'
                },
                "log-level": {
                    value: null,
                    status: 'Default'
                },
                "neighborhood-mode": {
                    value: null,
                    status: 'Default'
                },
                "neighbors": {
                    value: null,
                    status: 'Default'
                },
                "real-user": {
                    value: null,
                    status: 'Default'
                }
            }
        }
    },
    mutations: {
        onLoad: (state) => state.isPageLoaded = true,
        // @param {String} log message with time
        log: (state, message) => state.session.logs.push(`${ new Date().toISOString() }: ${ message }`),

        dismisSetupErrors: (state) => state.setupErrors = null,

        setSetupErrors: (state, errors) => state.setupErrors = errors,

        connected: (state, service) => state.session.websocket[service].isConnected = true,

        disconnected: (state, service) => state.session.websocket[service].isConnected = false,

        updateNodePort: (state, port) => state.session.websocket.node.port = port,

        appendFinancials: (state, payload) => {
            state.session.financials.timesPolled.push(payload.time);
            state.session.financials.credit.push(payload.credit);
            state.session.financials.debt.push(payload.debt);
        },

        updateStartingStatus: (state, value) => state.isNodeStarting = value,

        updateRunningStatus: (state, value) => {
            state.isNodeRunning = value;
            state.isNodeStarting = false;
        },

        setFinancialsInterval: (state, value) => state.session.financialsInterval = value,

        setFinancialBalances: (state, payload) => {
            state.session.financials.ethBalance = payload.eth; // eth
            state.session.financials.masqBalance = payload.masq; // eth
        },

        updateNodeSetup: (state, setup) => state.node.setup = setup,

        updateSetupProperty: (state, payload) => {
            state.node.setup[payload.name].value = payload.value;
            //state.node.setup[payload.name].status = 'Set';
            console.log('UPDATESETUPPROPERTY', payload.name, payload.value);
            state.node.setup[payload.name].isChanged = true;
        },

        setWalletSetStatus: (state, isSet) => state.node.walletSet = isSet,

        replaceSettings: (state, settings) => state.settings = settings,

        updateSettings: (state, payload) => {
            state.settings[payload.name] = payload.value;
        },

        // Assistant
        toggleAssistantBody: (state) => state.session.assistant.showBody = !state.session.assistant.showBody,

        appendAssistantMessage: (state, message) => {
            message['id'] = Math.floor(Math.random() * 100000);
            message['time'] = + new Date(); // add time property
            state.session.assistant.messages.push(message);
        },

        clearAssistantMessages: (state) => state.session.assistant.messages = [],

        replaceAssistantUserResponses: (state, resps) => state.session.assistant.availUserResponses = resps,

        clearAssistantUserResponses: (state, resps) => state.session.assistant.availUserResponses = [],

        archiveAssistantMessages: (state) => state.session.assistant.messages.forEach((msg) => state.session.assistant.messageArchive.push(msg)),
    },
    getters: {
        // @returns {Boolean} if there is an active connection to daemon or the node
        anyConnection: state => state.session.websocket.daemon.isConnected || state.session.websocket.node.isConnected,

        // @returns {String} of websocket target name (daemon or node) and port
        targetConnection: state => state.session.websocket.node.isConnected ? `node:${state.session.websocket.node.port}` : `daemon:${state.settings.daemonPort}`,

        logs: state => [...state.session.logs].reverse().join('<br>'),

        disableOnOff: state => state.session,

        isNodeConnected: state => state.session.websocket.node.isConnected,

        isWalletConfigured: state => state.node.setup.hasOwnProperty('earning-wallet') && state.node.setup['earning-wallet'].value.length > 0,

        debt: state => state.session.financials.debt.slice(-1)[0],

        credit: state => state.session.financials.credit.slice(-1)[0],

    },
    actions: {
        updateBalances: async (context) => {
            try {
                let result = await balanceproviders.EthPlorer(context.state.node.setup['earning-wallet'].value, 'freekey');
                console.log(result);
                context.commit('setFinancialBalances', result);
            } catch (error) {
                console.error('StateStore.js:updateBalances', error);
                context.commit('log', 'Unable to fetch eth address balances');
            }
        }
    }
}