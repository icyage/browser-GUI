import ErrorLogic from './ErrorLogic.js';

export default class Assistant {
    constructor() {
        this._store = null;
        this._errorLogic = new ErrorLogic();

        // last error (track as to not duplicate resolutions)
        this._last_error = '';
        this._setupBackup = null;

        this.PARTY_POPPER = '🎉';
    }

    plugin(store) {
        this._store = store;

        store.subscribe((mutation, payload) => {
            switch(mutation.type) {
                case 'setSetupErrors':
                    if(store.state.settings.enableAssistant) this.errorKickstart(store.state.setupErrors);
                break;
            }
        });
    }

    endConversation() {
        // resolve user response callbacks that may be pending
        this._store.state.session.assistant.availUserResponses.forEach((resp) => {
            resp.callback('cancelled');
        });

        this._store.commit('archiveAssistantMessages'); // archive older messages
        this._store.commit('clearAssistantMessages'); // remove older messages
        this._store.commit('clearAssistantUserResponses'); // clear user responses
    }
    
    async errorKickstart(errors) {
        let resolver;
        if(!errors.length) {
            // no errors
            this._last_error = '';
            this.endConversation();
            return;
        }

        let error = errors[0][1];

        if(error == this._last_error) return; // ignore no errors or duplicate errors
        this._last_error = error; // update _last_error tracker

        this.endConversation();

        console.log('Assistant.js:errorKickstart', 'has received error state change');

        //this._store.commit('clearAssistantMessages'); // remove older messages
        resolver = this._errorLogic.classifyError(error);
        console.log('RESOLVER VALUE', resolver);

        if(resolver === false) {
            // unknown error
            console.log('Assistant.js:errorKickstart', 'Not confident of solution')
            return;
        }
        console.log('Assistant.js:errorKickstart', 'Error classified', resolver);

        let resolveIterator = resolver(this._store, (message) => this._store.commit('appendAssistantMessage', message));

        // start iterating over all the steps from the error resolver
        let result = resolveIterator.next();
        let lastUserResp = null;
        while(!result.done) {
            console.log('step x');

            lastUserResp = await result.step(lastUserResp);

            if(lastUserResp != 'cancelled') {
                // keep going
                if(lastUserResp) this._store.commit('appendAssistantMessage', { from: 'user', text: lastUserResp })
                result = resolveIterator.next();
            } else {
                // canceled
                result.done = true;
            }
        }

        this.endConversation();
    }
}