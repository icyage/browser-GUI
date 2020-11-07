export class Messenger {
    constructor() {
        this.__ws = null; // websocket to Masq Daemon
        this._isConnected = false;
        this._port = null;
        this._eventSubscribers = {
            // init with standard events
            open: [],
            close: [],
            error: [],
        };
        this._contextId = Math.round(Math.random() * 10000);
        this._contextIds = [this._contextId]; // list of conversation context ids

        this.OPCODE_IGNORE_CONTEXTIDS = ['setup', 'redirect', 'crash'];

    }

    getPort() {
        return this._port;
    }

    connect(port = 5333) {
        if(this._ws) {
            this._ws.close();
        }
        setTimeout(() => {
            this._ws = new WebSocket(`ws://localhost:${port}`, 'MASQNode-UIv2');

            // add listeners
            this._ws.onopen =       this.onOpen.bind(this);
            this._ws.onmessage =    this.onMessage.bind(this);
            this._ws.onerror =      this.onError.bind(this);
            this._ws.onclose =      this.onClose.bind(this);

            this._port = port;
        }, 1000);
    }

    send(opcode, payload = {}) {
        this._ws.send(
            JSON.stringify({
                'opcode': opcode,
                'contextId': this._contextId,
                'payload': payload
            })
        );
    }

    onOpen(e) {
        this._isConnected = true;

        this._eventSubscribers['open'].forEach((callback) => {
            callback(e);
        });

    }

    onMessage(e) {
        const message =     JSON.parse(e.data);
        const opcode =      message.opcode;
        const contextId =   message.contextId;
        const payload =     message.payload || null;
        const error =       message.error || null;

        console.log('opcode', opcode);

        // check contextId
        if(this.OPCODE_IGNORE_CONTEXTIDS.includes(opcode) || this._contextIds.includes(contextId)) {
            // continue if any callbacks exist for opcode
            if(this._eventSubscribers.hasOwnProperty(opcode)) {
                // callback all subscribers with payload
                this._eventSubscribers[opcode].forEach((callback) => {
                    callback(payload, error);
                });
            }
        }
    }

    onError() {
        this._isConnected = false;
    }

    onClose(e) {
        this._isConnected = false;

        this._eventSubscribers['close'].forEach((callback) => {
            callback(e);
        });
    }

    /**
     * Set callback for either standard WebSocket life cycle event, or node protocol message type (opcode) with message. 
     * @param {String} eventName Either standard WebSocket event (open, close, error; excludes messages) or node protocol message type (opcode).
     * @param {Function} callback Function to be called when event or message type occurs.
     */
    on(eventName, callback) {
        // check if eventName in dict
        if(!eventName.hasOwnProperty('eventName')) {
            // add eventName to dict with empty array
            this._eventSubscribers[eventName] = [];
        }

        this._eventSubscribers[eventName].push(callback);
    }
}