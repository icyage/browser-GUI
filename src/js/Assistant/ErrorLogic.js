import { Utils } from '../utils.js';

export default class ErrorLogic {
    constructor() {
        this.THRESHOLD = 0.15; // probability cutoff for naive bayes

        this.handledErrorClasses = [
            {
                resolver: this.FixNoNeighbor,
                errorMessage: 'Node cannot run as --neighborhood-mode originate-only without --neighbors specified', // as seen 2020-08-19
            },
            {
                // Fake one
                resolver: () => console.log('Unknown!'),
                errorMessage: ''
            },
            {
                resolver: this.FixBlankIP,
                errorMessage: 'Node cannot run as --neighborhood-mode standard without --ip specified',
            },
            {
                resolver: this.RemoveIP,
                errorMessage: 'Node cannot run as --neighborhood-mode zero-hop if --ip is specified'
            },
            {
                resolver: this.FixNoNeighbor, // duplicates class 1 logic
                errorMessage: 'Public key must decode to 32 bytes, not 33 base64'
            },
            {
                resolver: this.changeChainOrGetValidDescriptor,
                errorMessage: "Mainnet node descriptors use '@', not ':', as the first delimiter"
            },
            {
                resolver: this.RemoveNeighbors,
                errorMessage: "Node cannot run as --neighborhood-mode zero-hop if --neighbors is specified"
            }
        ];
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
    static stepIterator(steps) {
        let nextIndex = 0;

        const stepIterator = {
            next: function() {
                let result;
                if(nextIndex < steps.length) {
                    result = { step: steps[nextIndex], done: false }
                    nextIndex++;
                    return result;
                }
                return { value: steps.length, done: true }
            }
        }

        return stepIterator;
    }

    /**
     * Classify user error with known errors, and return its resolver function.
     * @param {String} error Error message that needs classifying.
     * @returns {Function} Resolver function for known error handling
     */
    classifyError(error) {
        // naive bayes
        let errorParts = error.toLowerCase().split(/ /);

        let probs = new Array(this.handledErrorClasses.length);

        this.handledErrorClasses.forEach((knownErrorMsg, i) => {
            probs[i] = [];
            errorParts.forEach((x) => {
                let kErrParts = knownErrorMsg.errorMessage.toLowerCase().split(/ /);
                let prob = kErrParts.filter(y => y==x).length / kErrParts.length;
                probs[i].push(prob);
            })
        })

        let summedProbs = probs.map(arr => arr.reduce((a, b) => a + b, 0));

        console.log('Best probability', summedProbs);

        let idxOfKnown = summedProbs.indexOf(Math.max(...summedProbs));

        return Math.max(...summedProbs) > this.THRESHOLD ? this.handledErrorClasses[idxOfKnown].resolver : false;
    }

    FixNoNeighbor($store, addMessage) {
        /**
         * Step 1:  As user for permission to fix the problem
         * Step 2:  ('yes') Query nodes API for active descriptor
         *          Respond with success status message
         */
        const steps = [
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: "You'll need a valid 'Node Descriptor' for this mode." }); // overview of the problem
                    addMessage({ from: 'masq', text: "If you'd like, I can get one from nodes.masq.ai automatically?" }); // offer to help

                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: false, text: 'No', callback: resolve },
                    ]);
                });
            },
            async (response) => { 
                if(response) {
                    // user indicated for assistant to proceed
                    let descriptor;
                    if(descriptor = await Utils.getPublicDescriptor()) {
                        $store.commit('updateSetupProperty', { name: 'neighbors', value: descriptor }); // populate ip setup value
                        addMessage({ from: 'masq', text: '🎉 done' });
                    } else {
                        // error getting public descriptor
                        addMessage({ from: 'masq', text: 'Sorry, couldn\'t get a public node descriptor.' });
                    }
                } else {
                    // quit
                    addMessage({ from: 'user', text: 'No' });
                    addMessage({ from: 'masq', text: 'If you need one in the future, you know where to go now.' });
                }
            }
        ]

        return ErrorLogic.stepIterator(steps);
    }

    FixBlankIP($store, addMessage) {
        /**
         * Step 1:  As user for permission to fix the problem
         * Step 2:  ('yes') Populate ip in setup values
         *          Respond with success status message
         */
        const steps = [
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: "We'll need your IP to enable this mode." }); // overview of the problem
                    addMessage({ from: 'masq', text: 'Would you like me to fix that for you?' }); // offer to help

                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: false, text: 'No', callback: resolve },
                    ]);
                });
            },
            async (response) => { 
                if(response) {
                    // user indicated for assistant to proceed
                    let currentIP;
                    // get current IP
                    if(currentIP = await Utils.getCurrentIP()) {
                        $store.commit('updateSetupProperty', { name: 'ip', value: currentIP }); // populate ip setup value
                        addMessage({ from: 'masq', text: '🎉 done' })
                    } else {
                        // error getting IP
                        addMessage({ from: 'masq', text: 'Sorry, couldn\'t get your IP address'});
                    }
                } else {
                    // quit
                    addMessage({ from: 'user', text: 'No' });
                    addMessage({ from: 'masq', text: 'Okay' });
                }
            }
        ]

        return ErrorLogic.stepIterator(steps);
    }

    RemoveIP($store, addMessage) {
        /**
         * Step 1:  As user for permission to fix the problem
         * Step 2:  ('yes') Remove ip from setup values
         *          Respond with success status message
         */
        const steps = [
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: "We'll have to remove your IP address for this mode." }); // overview of the problem
                    addMessage({ from: 'masq', text: 'Would you like me to fix that for you?' }); // offer to help
                    
                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: false, text: 'No', callback: resolve },
                    ]);
                });
            },
            async (response) => {
                if(response) {
                    // user indicated for assistant to proceed
                    $store.commit('updateSetupProperty', { name: 'ip', value: null });
                    addMessage({ from: 'masq', text: '🎉  Done' });
                } else {
                    // quit
                    addMessage({ from: 'user', text: 'No' });
                    addMessage({ from: 'masq', text: 'Okay.' });
                }
            }
        ]
        //addMessage({ from: 'user', text: 'yes, remove' });

        return ErrorLogic.stepIterator(steps);
    }

    RemoveNeighbors($store, addMessage) {
        /**
         * Step 1:  As user for permission to remove neighbors setup value
         * Step 2:  ('yes') Remove neighbor(s) from setup values
         *          Respond with success status message
         */
        const steps = [
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: "You have specified a neighbor, but want to run zero-hop mode." }); // overview of the problem
                    addMessage({ from: 'masq', text: 'Do you want me to remove your neighbor?' }); // offer to help
                    
                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: false, text: 'No', callback: resolve },
                    ]);
                });
            },
            async (response) => {
                if(response) {
                    // user indicated for assistant to proceed
                    $store.commit('updateSetupProperty', { name: 'neighbors', value: null });
                    addMessage({ from: 'masq', text: '🎉  Done' });
                } else {
                    // quit
                    addMessage({ from: 'user', text: 'No' });
                    addMessage({ from: 'masq', text: 'Okay.' });
                }
            }
        ]
        //addMessage({ from: 'user', text: 'yes, remove' });

        return ErrorLogic.stepIterator(steps);
    }

    changeChainOrGetValidDescriptor($store, addMessage) {
        const currentChain = $store.state.node.setup.chain;
        /**
         * Step 1:  As user for permission to change chain
         * Step 2:  ('yes') Remove ip from setup values
         *          Respond with success status message
         * Step 2:  ('no') Pass off to FixNoNeighbor
         */
        const steps = [
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: `Your node descriptor doesn't match your chain selection.` }); // overview of the problem
                    addMessage({ from: 'masq', text: `Switch chain to ${currentChain == 'mainnet' ? 'ropsten' : 'mainnet'}?` }); // offer to help
                    
                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: 'no', text: 'No', callback: resolve },
                    ]);
                });
            },
            (response) => {
                if(response == 'yes') {
                    // user indicated for assistant to proceed
                    $store.commit('updateSetupProperty', { name: 'chain', value: currentChain == 'mainnet' ? 'ropsten' : 'mainnet' });
                    addMessage({ from: 'masq', text: '🎉  Done' });
                    return 'cancelled';
                }
            },
            // optional portion
            () => {
                return new Promise(function(resolve, reject) {
                    addMessage({ from: 'masq', text: "You'll need a valid 'Node Descriptor' for this mode." }); // overview of the problem
                    addMessage({ from: 'masq', text: "If you'd like, I can get one from nodes.masq.ai automatically?" }); // offer to help

                    $store.commit('replaceAssistantUserResponses', [
                        { value: 'yes', text: 'Yes', callback: resolve },
                        { value: false, text: 'No', callback: resolve },
                    ]);
                });
            },
            (response) => { 
                if(response) {
                    // user indicated for assistant to proceed
                    $store.commit('updateSetupProperty', { name: 'neighbors', value: 'K701GTsyAsRUOatbvMGDJaLzATdt3S9/h6Tt0QOatgc@40.114.233.72:1025' }); // populate ip setup value
                    addMessage({ from: 'masq', text: '🎉 done' })
                } else {
                    // quit
                    addMessage({ from: 'user', text: 'No' });
                    addMessage({ from: 'masq', text: 'If you need one in the future, you know where to go now.' });
                }
            }
        ]
        //addMessage({ from: 'user', text: 'yes, remove' });

        return ErrorLogic.stepIterator(steps);
    }

}