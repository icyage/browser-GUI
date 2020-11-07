<template>
    <div>
        <b-row>
            <!-- Language Select -->
            <b-col>
                <b-form-group label="Language" label-for="lang-select">
                    <b-form-select
                        id="lang-select"
                        v-model="form.lang"
                        :options="langOptions"
                    ></b-form-select>
                </b-form-group>
            </b-col>

            <!-- Word Count Select -->
            <b-col>
                <b-form-group label="Word Count" label-for="lang-select">
                    <b-form-select
                        id="lang-select"
                        v-model="form.wordCount"
                        :options="wordCountOptions"
                    ></b-form-select>
                </b-form-group>
            </b-col>
        </b-row>

        <!-- Seed (Recover Only) -->
        <b-row v-show="isRecover">
            <b-col>
                <label for="seed-tags">Seed</label>
                <b-form-tags
                    input-id="seed-tags"
                    :input-attrs="{ 'aria-describedby': 'seed-tags' }"
                    v-model="form.seed"
                    separator=" "
                    placeholder=""
                    size="md"
                    class="mb-3"
                    remove-on-delete
                    no-add-on-enter
                ></b-form-tags>
            </b-col>
        </b-row>

        <b-row v-if="1==2">
            <!-- Passphrase -->
            <b-col>
                <b-form-group
                    label="Passphrase"
                    label-for="passphrase-input"
                >
                    <b-input-group>
                        <b-form-input
                            id="passphrase-input"
                            v-model="form.passphrase"
                            :type="showPassphrase ? 'text' : 'password'"
                        >
                        </b-form-input>
                        <b-input-group-append is-text style="cursor: pointer;" @click="showPassphrase = !showPassphrase">
                            <b-icon :icon="showPassphrase ? 'eye' : 'eye-slash'"></b-icon>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>

        <b-row>
            <!-- Wallet Password Input -->
            <b-col>
                <b-form-group
                    label="Wallet Password"
                    label-for="wallet-password-input"
                >
                    <b-input-group>
                        <b-form-input
                            id="wallet-password-input"
                            v-model="form.walletPassword"
                            :type="showWalletPassword ? 'text' : 'password'"
                        >
                        </b-form-input>
                        <b-input-group-append is-text style="cursor: pointer;" @click="showWalletPassword = !showWalletPassword">
                            <b-icon :icon="showWalletPassword ? 'eye' : 'eye-slash'"></b-icon>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>

        <!-- Advanced Options -->
        <b-collapse id="collapse-wallet-advanced" class="mt-2" :visible="showAdvanced">
            <b-row>
                <!-- earning derivation path -->
                <b-col>
                    <b-form-group
                        label="Earning Derivation Path"
                        label-for="derivation-consume"
                    >
                        <b-form-input
                            id="derivation-consume-input"
                            v-model="form.derivationPathConsume"
                            type="text"
                        >
                        </b-form-input>
                    </b-form-group>
                </b-col>

                <!-- consuming derivation path -->
                <b-col>
                    <b-form-group
                        label="Consuming Derivation Path"
                        label-for="derivation-earn-input"
                    >
                        <b-form-input
                            id="derivation-earn-input"
                            v-model="form.derivationPathEarn"
                            type="text"
                        >
                        </b-form-input>
                    </b-form-group>
                </b-col>
            </b-row>
        </b-collapse>

        <b-link @click="showAdvanced = !showAdvanced">
            <b-icon :icon="showAdvanced ? 'caret-up' : 'caret-down'"></b-icon>
            Advanced
        </b-link>

        
    </div>
</template>

<script>
export default {
    props: {
        isRecover: {
            type: Boolean,
            required: false,
            default: function() {
                return false;
            }
        }
    },
    data() {
        return {
            // form
            form: {
                lang: 'en',
                wordCount: 12,
                passphrase: '',
                derivationPathConsume: "m/44'/60'/0'/0/0",
                derivationPathEarn: "m/44'/60'/0'/0/0",
                walletPassword: '',
                seed: [], // Recover Only
            },

            // form data & defaults
            // lang: (? worth it) The official wordlists availalbe in at `ethers.wordlists`. In the browser, only the english langauge is available by default;
            langOptions: [
                //{ value: 'cz', text: 'Czech' },
                { value: 'en', text: 'English' },
                /*{ value: 'es', text: 'Spanish' },
                { value: 'fr', text: 'French' },
                { value: 'it', text: 'Italian' },
                { value: 'ja', text: 'Japenese' },
                { value: 'ko', text: 'Korean' },
                { value: 'zh_cn', text: 'Simplified Chinese' },
                { value: 'zh_tw', text: 'Traditional Chinese' }*/
            ],
            wordCountOptions: [
                { value: 12, text: 12 },
                //{ value: 15, text: 15 },
                //{ value: 18, text: 18 },
                //{ value: 21, text: 21 },
                //{ value: 24, text: 24 },
            ],
            derivationPathDefault: [
                "m/44'/60'/0'/0/0", // consume
                "m/44'/60'/0'/0/1" // earn (optional)
            ],
            // form state
            showPassphrase: false,
            showWalletPassword: false,
            showAdvanced: false,
        }
    },
    watch: {
        form: {
            deep: true,
            handler() {
                console.log('Form.vue:(watcher)', 'formChange emit')
                this.$emit('formChange', this.form);
            }
        }
    }
}
</script>