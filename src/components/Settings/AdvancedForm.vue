<template>
    <b-card>
        <b-list-group flush>
            <!-- Advanced setup synced with node status -->
            <b-row>
                <b-col>
                    <div class="float-right">
                        <b-icon :icon="synced ? 'check2-circle' : 'circle'" :variant="synced ? 'success' : 'warning'"></b-icon>
                        <span class="text-muted">synced</span>
                    </div>
                </b-col>
            </b-row>

            <b-list-group-item>
                <!-- Chain -->
                <b-row>
                    <b-col cols="6">
                        <h5>Chain</h5>
                        <p>The blockchain the Node should connect to</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-select class="mt-3" v-model="setupCopy['chain'].value" :options="chainOptions"></b-form-select>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Node Descriptor -->
                <b-row>
                    <b-col cols="6">
                        <h5>Node Descriptor</h5>
                        <p>MASQ Node neighbor to initially connect to</p>
                    </b-col>
                    <b-col cols="6">
                        <b-input-group class="mt-3">
                            <b-form-input v-model="setupCopy['neighbors'].value"></b-form-input>
                            <b-input-group-append>
                                <b-button variant="secondary" @click="fetchPublicDescriptor" v-b-tooltip.hover title="Fetch Public Descriptor">
                                    <b-icon v-show="!queryingNeighbor" icon="cloud-arrow-down"></b-icon>
                                    <b-spinner v-show="queryingNeighbor" small type="grow"></b-spinner>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Earning Wallet -->
                <b-row class="mt-3">
                    <b-col cols="6">
                        <h5>Earning Wallet</h5>
                        <p>Wallet into which earnings should be deposited</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-input v-model="setupCopy['earning-wallet'].value" class="mt-3" :disabled="$store.state.node.walletSet"></b-form-input>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Gas Price -->
                <b-row class="mt-3">
                    <b-col cols="6">
                        <h5>Gas Price</h5>
                        <p>Transaction fee to offer on the blockchain</p>
                    </b-col>
                    <b-col cols="6">
                        <b-input-group append="gwei" class="mt-3">
                            <b-form-input v-model="setupCopy['gas-price'].value"></b-form-input>
                        </b-input-group>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Blockchain Service URL (Infura) -->
                <b-row>
                    <b-col cols="6">
                        <h5>Blockchain Service URL</h5>
                        <p>URL of the blockchain service to use: currently only Infura is supported</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-input class="mt-3" v-model="setupCopy['blockchain-service-url'].value"></b-form-input>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- IP Address -->
                <b-row class="mt-3">
                    <b-col cols="6">
                        <h5>IP Address</h5>
                        <p>Your Node IP Address</p>
                    </b-col>
                    <b-col cols="6">
                        <b-input-group class="mt-3">
                            <b-form-input v-model="setupCopy['ip'].value"></b-form-input>
                            <b-input-group-append>
                                <b-button variant="secondary" @click="fillCurrentIP">
                                    <b-icon v-show="!queryingIP" icon="cloud-arrow-down"></b-icon>
                                    <b-spinner v-show="queryingIP" small type="grow"></b-spinner>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- clandestine-port -->
                <b-row class="mt-3">
                    <b-col cols="6">
                        <h5>Clandestine Port</h5>
                        <p>Firewall bypassed port to enable incoming data to reach you on your node</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-input class="mt-3" v-model="setupCopy['clandestine-port'].value"></b-form-input>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- DNS Servers -->
                <b-row class="mt-3">
                    <b-col cols="6">
                        <h5>DNS Servers</h5>
                        <p>DNS servers to use</p>
                    </b-col>
                    <b-col>
                        <b-form-input class="mt-3" v-model="setupCopy['dns-servers'].value"></b-form-input>
                        <!--<b-form-tags
                            input-id="seed-tags"
                            :input-attrs="{ 'aria-describedby': 'seed-tags' }"
                            v-model="setupCopy['dns-servers'].value"
                            separator=" "
                            placeholder=""
                            size="md"
                            class="mb-3"
                            remove-on-delete
                            no-add-on-enter
                        ></b-form-tags>-->
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-link @click="showExpert = !showExpert">
                <b-icon :icon="showExpert ? 'caret-up' : 'caret-right'"></b-icon>
                Expert
            </b-link>

            
                <!-- Advanced Options -->
                <b-collapse id="collapse-settings-expert" class="mt-2" :visible="showExpert">
                    <b-list-group-item>
                        <!-- Data Directory -->
                        <b-row class="mt-3">
                            <b-col cols="6">
                                <h5>Data Directory</h5>
                                <p>Directory in which MASQ Node will keep the state that needs to persist from run to run</p>
                            </b-col>
                            <b-col cols="6">
                                <b-form-input v-model="setupCopy['data-directory'].value" class="mt-3"></b-form-input>
                            </b-col>
                        </b-row>
                    </b-list-group-item>

                    <b-list-group-item>
                        <!-- Config File -->
                        <b-row class="mt-3">
                            <b-col cols="6">
                                <h5>Config File</h5>
                                <p>Persistent MASQ Node setup values file</p>
                            </b-col>
                            <b-col cols="6">
                                <b-form-input v-model="setupCopy['config-file'].value" class="mt-3"></b-form-input>
                            </b-col>
                        </b-row>
                    </b-list-group-item>

                    <b-list-group-item v-if="setupCopy.hasOwnProperty('real-user')">
                        <!-- Real User -->
                        <b-row class="mt-3">
                            <b-col cols="6">
                                <h5>Real User</h5>
                                <p>Non-Windows platforms only, only where required (e.g. GUI:UID:/home/user)</p>
                            </b-col>
                            <b-col cols="6">
                                <b-form-input v-model="setupCopy['real-user'].value" class="mt-3" placeholder="1000:1000:/home/user"></b-form-input>
                            </b-col>
                        </b-row>
                    </b-list-group-item>

                </b-collapse>

        </b-list-group>

                

                <!-- save/reset buttons -->
                <b-row class="mt-3">
                    <b-col>
                        <div class="float-right">
                            <b-button variant="outline-secondary" @click="resetSetupCopy" :disabled="synced">Reset</b-button>
                            <b-button variant="outline-primary" @click="saveClicked" :disabled="synced">Save</b-button>
                        </div>
                    </b-col>
                </b-row>
    </b-card>
</template>

<script>
export default {
    data() {
        return {
            showExpert: false,
            synced: true,
            unsynced: [],
            setupCopy: null,
            queryingIP: false,
            queryingNeighbor: false,
            // options
            chainOptions: [
                { value: 'mainnet', text: 'Mainnet' },
                { value: 'ropsten', text: 'Ropsten' },
            ],
            // special input handling
            dnsServers: []
        }
    },
    methods: {
        resetSetupCopy: function() {
            let tmp = JSON.parse(JSON.stringify(this.$store.state.node.setup));
            //if(tmp['dns-servers'].value) tmp['dns-servers'].value = tmp['dns-servers'].value.split(/ ?, ?/); // split string: DNS servers require special handling for "tags" ui choice
            this.setupCopy = tmp;
        },
        checkSyncedStatus: function() {
            let tmp = JSON.parse(JSON.stringify(this.setupCopy));
            //if(tmp['dns-servers'].value) tmp['dns-servers'].value = tmp['dns-servers'].value.join(','); // join array: DNS servers require special handling for "tags" ui choice
            this.unsynced = this.utils.compareSetupDicts(this.$store.state.node.setup, tmp);
            this.synced = this.unsynced.length == 0;
        },
        async fillCurrentIP() {
            let ipAddress;
            this.queryingIP = true;
            if(ipAddress = await this.utils.getCurrentIP()) {
                this.setupCopy['ip'].value = ipAddress;
            } else {
                console.error(`Failed to get IP (${error})`)
                this.$state.commit('log', `Failed to get IP (${error})`)
            }
            this.queryingIP = false;
        },
        // modified from NodeDirectives.vue
        async fetchPublicDescriptor() {
            let descriptor;
            this.queryingNeighbor = true;

            if(descriptor = await this.utils.getPublicDescriptor(this.setupCopy['chain'].value === 'mainnet')) {
                this.setupCopy['neighbors'].value = descriptor;
            } else {
                this.createToast('danger', 'Error fetching public node descriptor.');
            }

            this.queryingNeighbor = false;
        },
        saveClicked: function() {
            let tmp = {...this.setupCopy};
            //if(tmp['dns-servers'].value) tmp['dns-servers'].value = tmp['dns-servers'].value.join(',');
            this.$store.commit('updateNodeSetup', tmp);
            this.$root.$data.controller.syncSetup(this.unsynced);
        }
    },
    watch: {
        "$store.state.node.setup": function(newS, oldS) {
            if(oldS === null) this.resetSetupCopy();
            console.log('AdvancedForm.vue:(watcher)', 'store.node.setup changed');
            this.resetSetupCopy(); // originally didn't have this
            this.checkSyncedStatus();
        },
        setupCopy: {
            deep: true,
            handler(newSC, oldSC) {
                if(oldSC === null) return; // ignore first change
                this.checkSyncedStatus();
            }
        },
    },
    beforeMount() {
        this.resetSetupCopy();
    }
}
</script>