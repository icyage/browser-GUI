<template>
    <b-card>
        <!-- On/Off command button -->
        <b-button 
            class="float-right" 
            :variant="$store.getters.isNodeConnected ? 'danger' : 'primary'" 
            :disabled="$store.state.isNodeStarting || $store.state.setupErrors.length > 0 || !$store.getters.anyConnection"
            @click="nodeOnOffBtnCLicked"
        >
            <!-- Power Icon [hidden on starting/shutting-down] -->
            <b-icon v-show="!$store.state.isNodeStarting" icon="power"></b-icon>

            <!-- Node is processing start or shutdown spinner icon [hidden on stale state] -->
            <b-spinner v-show="$store.state.isNodeStarting" small type="grow"></b-spinner>

            <!-- On/Off Button Text -->
            <span v-show="!$store.state.isNodeStarting">{{ $store.getters.isNodeConnected ? labels[$store.state.settings.lang].DISCONNECT : labels[$store.state.settings.lang].START }}</span>
        </b-button>

        <!-- Node mode type options -->
        <b-form-group class="mb-0" :description="modeDesr">
            <b-form-radio-group
                v-model="mode"
                :options="modeOptions"
                buttons
                button-variant="outline-info"
            >
            </b-form-radio-group>
        </b-form-group>

        <!-- IP Input (TODO: combine with neighborhood input collapse)-->
        <b-collapse 
            id="collapse-discriptor"
            :visible="showIPInput"
        >
            <div id="smooth-collapse-margin-alt" style="height: 24px;"></div>
            <b-input-group>
                <template v-slot:prepend>
                    <b-input-group-text>Your IP Address</b-input-group-text>
                </template>
                <b-form-input v-model.trim="localIPAddress"></b-form-input>

                <template v-slot:append>
                    <b-button variant="secondary" @click="setIP"> <!-- :disabled="isIPSynced" -->
                        <b-icon v-show="!queryingIP" icon="cloud-arrow-down"></b-icon>
                        <b-spinner v-show="queryingIP" small type="grow"></b-spinner>
                    </b-button>
                </template>
            </b-input-group>
        </b-collapse>

        <!-- NEIGHBOR descriptor  (TODO: combine with IP input collapse)-->
        <b-collapse 
            id="collapse-discriptor"
            :visible="showNeighborDescrInput"
        >
            <div id="smooth-collapse-margin-alt" style="height: 24px;"></div>
            <b-input-group>
                <template v-slot:prepend>
                    <b-input-group-text>Neighbor Descriptor</b-input-group-text>
                </template>
                <b-form-input v-model.trim="localNeighborDescriptor"></b-form-input>

                <template v-slot:append>
                    <b-button @click="fetchPublicDescriptor" variant="outline-secondary" v-b-tooltip.hover title="Fetch Public Descriptor">
                        <b-icon v-show="!queryingNeighbor" icon="cloud-arrow-down"></b-icon>
                        <b-spinner v-show="queryingNeighbor" small type="grow"></b-spinner>
                    </b-button>
                    <b-button v-show="localNeighborDescriptor && localNeighborDescriptor != descriptor" variant="outline-success" @click="setNeighbor" :disabled="isModeSynced">Set</b-button>
                </template>
            </b-input-group>
        </b-collapse>

        <!-- Node descriptor -->
        <b-collapse 
            id="collapse-discriptor"
            :visible="$store.state.isNodeRunning"
        >
            <div id="smooth-collapse-margin-alt" style="height: 24px;"></div>
            <b-input-group>
                <template v-slot:prepend>
                    <b-input-group-text>Local Descriptor</b-input-group-text>
                </template>
                <b-form-input ref="descriptorText" :value="$store.state.node.descriptor"></b-form-input>

                <template v-slot:append>
                    <!-- descriptor: copy button -->
                    <b-button 
                        id="btn-copy-descriptor" 
                        variant="transparent"
                        :data-clipboard-text="$store.state.node.descriptor"
                    >
                        <b-icon icon="files"></b-icon>
                    </b-button>

                    <!-- descriptor: share button -->
                    <b-button 
                        id="btn-share-descriptor" 
                        variant="transparent"
                    >
                        <b-icon icon="share"></b-icon>
                    </b-button>
                </template>
            </b-input-group>

            <!-- share popover -->
            <b-popover target="btn-share-descriptor" triggers="click blur" placement="left">
                <ShareDescriptor :descriptor="$store.state.node.descriptor" />
            </b-popover>
        </b-collapse>

        <!-- Setup Errors -->
        <b-collapse :visible="$store.state.setupErrors.length > 0">
            <b-card 
                border-variant="warning" 
                class="mt-3" 
                header-tag="header"
                header="Setup Errors" 
                header-text-variant="muted"
            >
                <!-- header slot -->
                <template v-slot:header>
                    <span class="d-inline-block" style="margin-top: 4px;">Setup Errors</span>
                    <!-- Assistant Open Button -->
                    <b-button 
                        v-show="$store.state.settings.enableAssistant && $store.state.session.assistant.messages.length > 0"
                        @click="$store.commit('toggleAssistantBody')"
                        variant="outline-primary" 
                        size="sm" 
                        class="float-right"
                    >
                        Open Assistant
                    </b-button>
                </template>
                <div
                    v-for="(error, i) in $store.state.setupErrors"
                    :key="i + error[0]"
                    class="text-muted"
                    style="font-size: 0.85rem;"
                >
                    <b>{{ error[0] }}</b> : {{ error[1] }}
                </div>
            </b-card>
        </b-collapse>

        <!-- descriptor button tooltips -->
        <b-tooltip target="btn-copy-descriptor" placement="top" :title="copySuccess ? labels[$store.state.settings.lang].COPIED : labels[$store.state.settings.lang].COPY"></b-tooltip>
        <b-tooltip target="btn-share-descriptor" placement="top" :title="labels[$store.state.settings.lang].SHARE"></b-tooltip>
    </b-card>
</template>

<script>
import clipboard from 'clipboard/src/clipboard';
import ShareDescriptor from './ShareDescriptor.vue';

export default {
    components: {
        ShareDescriptor
    },
    data() {
        return {
            modeOptions: [],
            //processing: false, // npt ue
            copySuccess: false, // true for only 3 seconds after copy success
            localNeighborDescriptor: "", // copy of setup value 'neighbors'. Sync lazily
            // IP field
            localIPAddress: "",
            queryingIP: false,
            queryingNeighbor: false,
            lastMode: null,
        }
    },
    methods: {
        nodeOnOffBtnCLicked: function() {
            this.$store.commit('updateStartingStatus', true);

            if(this.$store.getters.isNodeConnected) {
                // shutdown node
                this.$root.$data.controller.shutdown();
            } else {
                // start node
                this.$root.$data.controller.start();
            }
        },
        async fetchPublicDescriptor() {
            let descriptor;
            this.queryingNeighbor = true;
            if(descriptor = await this.utils.getPublicDescriptor(this.isMainnet)) {
                this.localNeighborDescriptor = descriptor;
                this.setNeighbor();
            } else {
                this.createToast('danger', 'Error fetching public node descriptor.');
            }
            this.queryingNeighbor = false;
        },
        setNeighbor: function() {
            this.$store.commit('updateSetupProperty', {
                name: 'neighbors',
                value: this.localNeighborDescriptor
            });
        },
        async setIP() {
            let ipAddress;
            this.queryingIP = true;
            if(ipAddress = await this.utils.getCurrentIP()) {
                this.localIPAddress = ipAddress;
            } else {
                console.error(`Failed to get IP (${error})`)
                this.$state.commit('log', `Failed to get IP (${error})`)
            }

            // update setup value 'IP'
            this.$store.commit('updateSetupProperty', {
                name: 'ip',
                value: this.localIPAddress
            });

            this.queryingIP = false;
        },
        getSavedNeighbors: function() {
            // update neighbors value for local editing
            this.localNeighborDescriptor = this.$store.state.node.setup['neighbors'].value;
        },
        getSavedIP: function() {
            // update neighbors value for local editing
            this.localIPAddress = this.$store.state.node.setup['ip'].value;
        },
        updateRadioGroupStates: function() {
            console.log('NodeDirectives.vue:updateRS', 'isNodeRunning', this.$store.state.isNodeRunning);
            if(this.$store.state.isNodeRunning) {
                // disabled mode options not selected before start
                this.modeOptions.forEach((option, i, arr) => {
                    arr[i].disabled = this.$store.state.node.setup['neighborhood-mode'].value !== option.value;
                });
            } else {
                // node off
                // enable all options
                this.modeOptions.forEach((option, i, arr) => {
                    arr[i].disabled = false;
                });
            }
        }
    },
    watch: {
        "$store.state.isNodeRunning": function() {
            this.updateRadioGroupStates();
        },
        "$store.state.node.setup": function() {
            this.getSavedNeighbors();
            this.updateRadioGroupStates();
        }
    },
    computed: {
        isMainnet: {
            get() {
                return this.$store.state.node.setup["chain"].value === "mainnet";
            }
        },
        descriptor: function() {
            return this.$store.state.node.setup["neighbors"].value;
        },
        mode: {
            get() {
                let mode = this.$store.state.node.setup['neighborhood-mode'].value;
                this.lastMode = mode;
                return mode;
            },
            set(value) {
                console.log('NodeDirectives.vue:computed', 'MODE UPDATE');
                if(this.lastMode == value || this.lastMode === null) return;
                this.lastMode = value;

                this.$store.commit('updateSetupProperty', {
                    name: 'neighborhood-mode',
                    value
                });
                console.log('UPDATED!')

                this.$root.$data.controller.syncSetup();
            }
        },
        modeDesr: function() {
            switch(this.$store.state.node.setup['neighborhood-mode'].value) {
                case 'originate-only':
                    return this.labels[this.$store.state.settings.lang].SERVE_DESR;
                case 'consume-only':
                    return 'Consume only';
                case 'standard':
                    return this.labels[this.$store.state.settings.lang].FULL_DESR;
                case 'zero-hop':
                    return 'Zero-hop MASQ Node is very easy to start, and it\'s self-contained';
                default:
                    return '';
            }
        },
        showNeighborDescrInput: function() {
            return !this.$store.state.isNodeRunning && !['zero-hop', 'standard'].includes(this.$store.state.node.setup['neighborhood-mode'].value);
        },
        showIPInput: function() {
            return !this.$store.state.isNodeRunning && ['standard'].includes(this.$store.state.node.setup['neighborhood-mode'].value);
        },
        isModeSynced: function() {
            return this.$store.state.node.setup['neighbors'].value == this.localNeighborDescriptor;
        },
        isIPSynced: function() {
            return this.$store.state.node.setup['ip'].value == this.localIPAddress;
        }
    },
    mounted() {

        // update neighbors value for local editing
        this.getSavedNeighbors();
        this.getSavedIP();

        this.modeOptions = [
            //{ text: this.labels[this.$store.state.settings.lang].OFF.toUpperCase(), value: 0, disabled: false },
            { text: this.labels[this.$store.state.settings.lang].SERVE.toUpperCase(), value: 'originate-only', disabled: false },
            { text: 'CONSUME', value: 'consume-only', disabled: false},
            { text: this.labels[this.$store.state.settings.lang].FULL.toUpperCase(), value: 'standard', disabled: false },
        ];

        // TODO: refactor
        if(this.$store.state.settings.enableZeroHop) this.modeOptions.push({ text: 'ZERO-HOP', value: 'zero-hop', disabled: false });

        // clipboard copy instance
        let cb = new clipboard('#btn-copy-descriptor');
        cb.on('success',  () => {
            this.copySuccess = true;
            setTimeout(() => {
                this.copySuccess = false;
            }, 3000);
        });
        cb.on('error', () => {
            // unhandled. Queitly fail
        });

        this.updateRadioGroupStates(); // ensure mode options are enabled or disabled appropriately
    }
}
</script>