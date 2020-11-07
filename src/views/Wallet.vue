<template>
    <div v-if="$store.state.node.setup !== null">
        <b-row class="mb-4">
            <b-col>
                <h2>{{ labels[$store.state.settings.lang].WALLET }}</h2>
            </b-col>
        </b-row>

        <!-- No Wallet Placeholder +button -->
        <b-row>
            <b-col cols="12">
                <div>
                    <b-button 
                        variant="success" 
                        :disabled="doDisableButtons" 
                        v-b-modal.wallet-modal
                    >
                        Generate Wallet
                    </b-button>
                    <b-button 
                        variant="secondary" 
                        @click="$bvModal.show('wallet-import-modal')" 
                        :disabled="doDisableButtons"
                    >
                        <b-icon icon="upload"></b-icon>
                        Import Keystore
                    </b-button>
                </div>
            </b-col>
            <b-col v-show="!isWalletConfigured" class="mt-3">
                <b-card>
                    <span class="text-muted" style="font-size: 1.5rem;">Not Configured</span>
                </b-card>

            </b-col>
        </b-row>

        <!-- Existing wallet information -->
        <b-row v-show="isWalletConfigured">
            <b-col>
                <b-card-group deck>
                    <AddressCard
                        v-if="wallets.length == 0"
                        :address="$store.state.node.setup['earning-wallet'].value"
                        name="Earning"
                        class="mt-3"
                    ></AddressCard>
                </b-card-group>
            </b-col>
        </b-row>

        <!-- Address details card(s) -->
        <b-row v-show="isSeedConfirmed">
            <b-col>
                <b-card-group deck>
                    <AddressCard
                        v-for="(w, i) in wallets"
                        :key="w.address"
                        :address="w.address"
                        :name="i == 0 ? 'Consuming' : 'Earning'"
                        class="mt-3"
                    ></AddressCard>
                </b-card-group>
            </b-col>
        </b-row>

        <!-- Wallet Generation/Recover Modal Form -->
        <b-modal id="wallet-modal" title="Generate Wallet">
            <template v-slot:modal-header>
                <h5>Generate Wallet</h5>
                <b-form-checkbox v-model="isRecover" switch size="md" :disabled="isProcessing">Recover</b-form-checkbox>
            </template>

            <b-overlay 
                :show="isProcessing" 
                rounded="sm"
                variant="dark"
                spinner-variant="primary"
                spinner-type="grow"
            >
                <Form :is-recover="isRecover" @formChange="walletForm = $event"></Form>
            </b-overlay>

            <template v-slot:modal-footer>
                <b-button variant="outline-secondary" @click="$bvModal.hide('wallet-modal')" :disabled="isProcessing">Cancel</b-button>
                <b-button variant="success" @click="saveWallet" :disabled="isProcessing">{{ isRecover ? 'Recover' : 'Generate' }}</b-button>
            </template>
        </b-modal>

        <!-- Seed Confirmation Modal: walletBase !== null && !isSeedConfirmed -->
        <b-modal 
            id="seed-confirm-modal" 
            title="Confirm Seed" 
            :visible="wallets.length > 0 && !isSeedConfirmed"
            hide-footer
            no-close-on-esc
            no-close-on-backdrop
            hide-header-close
        >
        <!--  -->
            <SeedConfirmation 
                v-if="wallets.length > 0" 
                :mnemonic="walletBase.mnemonic.phrase"
                :is-downloading="isDownloading"
                :wallet-downloading="walletDownloading"
                :wallet-count="wallets.length"
                @delete="deleteWallet"
                @download="downloadWallet"
                @confirmed="seedConfirmed"
            ></SeedConfirmation>
        </b-modal>

        <!-- Import wallet modal -->
        <ImportWallet :is-processing-import="isProcessingImport" @import="importWalletFile"></ImportWallet>
    </div>
</template>

<script>
// components
import Form from '../components/Wallet/Form.vue';
import AddressCard from '../components/Wallet/AddressCard.vue';
import SeedConfirmation from '../components/Wallet/SeedConfirmation.vue';
import ImportWallet from '../components/Wallet/ImportWallet.vue';
import AnimatedCheck from '../components/common/AnimatedCheck.vue';

// venders
// ethers (wallet creation/recovery)
import { Wallet } from 'ethers';


export default {
    data() {
        return {
            // modal props
            isRecover: false,
            isProcessing: false,
            isDownloading: false,
            walletDownloading: null, // index of wallet downloading
            isSeedConfirmed: false,
            isProcessingImport: false,
            // temp testing
            walletBase: null,
            wallets: [], // first wallet is consuming, (optional if path different) second is earning
            walletForm: null, // defined on form emit 'formChange'
        }
    },
    computed: {
        doDisableButtons: function() {
            return this.$store.state.node.walletSet;
        },
        isWalletConfigured: function() {
            return this.$store.state.node.setup['earning-wallet'].status == 'Set';
        }
    },
    methods: {
        generateAllWallets: function(wBase, paths) {
            let uniquePaths = [...new Set(paths)];
            let mnemonic = wBase.mnemonic.phrase; // words

            uniquePaths.forEach((p) => {
                this.wallets.push(Wallet.fromMnemonic(mnemonic, p));
            });
        },
        createWallet: function() {
            this.walletBase = Wallet.createRandom();
            this.generateAllWallets(this.walletBase, [this.walletForm.derivationPathConsume, this.walletForm.derivationPathEarn]);
        },
        recoverWallet: function(mnemonic, path) {
            this.walletBase = Wallet.fromMnemonic(mnemonic, path);
            this.generateAllWallets(this.walletBase, [this.walletForm.derivationPathConsume, this.walletForm.derivationPathEarn]);
            // assumed user knows seed  well if inputted themselves
            // skip confirmation
            this.isSeedConfirmed = true;
        },
        saveWallet: function() {

            this.isProcessing = true;

            // setTimeout deemed required for 'isProcessing' to update render
            setTimeout(async () => {

                try {

                    if(this.isRecover) {
                        // recover existing wallet
                        this.recoverWallet(this.walletForm.seed.join(' '), this.walletForm.derivationPathConsume);
                    } else {
                        // create new wallet
                        this.createWallet();
                    }

                    // log it
                    this.$root.$data.controller.log(`Generated wallet(s)`);
                } catch(error) {
                    // log it
                    this.$root.$data.controller.log(`Unable to generate wallet(s) (${error})`);
                }


                this.$bvModal.hide('wallet-modal');
                this.isProcessing = false;
            }, 100);
        },
        importWalletFile(json, password) {
            this.isProcessingImport = true;

            setTimeout(() => {
                try {
                    this.walletBase = Wallet.fromEncryptedJsonSync(json, password);

                    this.wallets.push(this.walletBase);

                    this.$bvModal.hide('wallet-import-modal');

                    // skip due to no mnemonic in keystores
                    this.isSeedConfirmed = true;

                    // log it
                    this.$root.$data.controller.log(`User imported wallet (address: ${this.walletBase.address})`);
                } catch(error) {
                    // log it
                    this.$root.$data.controller.log(`User failed to imported wallet (${error})`);
                    this.createToast('warning', error);
                } finally {
                    this.isProcessingImport = false;
                }
            }, 100);

            
        },
        // NOTE: walletIndex is one-based numbering
        downloadWallet: async function(walletIndex) {
            this.isDownloading = true;
            this.walletDownloading = walletIndex;

            try {
                const date = new Date();
                const dateString = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
                const encryptedWalletJSON = await this.wallets[walletIndex-1].encrypt(this.walletForm.walletPassword);
                const walletType = walletIndex == 1 ? 'earning' : 'consuming';
                this.utils.downloadJSON(`masq_${walletType}_wallet_${dateString}.json`, encryptedWalletJSON);
                // log it
                this.$root.$data.controller.log(`User downloaded wallet keystore (address: ${this.wallets[walletIndex-1].address})`);
            } catch (error) {
                // log it
                this.$root.$data.controller.log(`Error downloading wallet`);
                console.error('failed to download wallet', error);
            }

            this.isDownloading = false;
        },
        deleteWallet() {
            this.walletBase = null;
            this.wallets = [];
            this.walletForm = null;
            this.isSeedConfirmed = false;
        },
        seedConfirmed: function() {
            this.isSeedConfirmed = true;

            // sync new wallets with masq
            //this.store.node.setup['db-password'].value = this.walletForm.walletPassword;
            this.$store.commit('updateSetupProperty', {
                name: 'consuming-private-key',
                value: this.walletBase.privateKey.replace(/^(0x)/, '')
            });
            this.$store.commit('updateSetupProperty', {
                name: 'earning-wallet',
                value: this.wallets.length == 1 ? this.wallets[0].address : this.wallets[1].address
            });
            this.$root.$data.controller.syncSetup();
        }
    },
    components: {
        Form,
        AddressCard,
        SeedConfirmation,
        ImportWallet,
        AnimatedCheck // testing only
    },
    mounted() {
        
    }
}
</script>