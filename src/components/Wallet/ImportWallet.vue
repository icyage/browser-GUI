<template>
    <b-modal id="wallet-import-modal" title="Import Wallet Keystore">
        <!-- Keystore File -->
        <b-row>
            <b-col>
                <label>File (Keystore)</label>
                <b-form-file v-model="form.file" accept="application/json" :disabled="isProcessingImport"></b-form-file>
            </b-col>
        </b-row>

        <!-- File Password -->
        <b-row class="mt-3">
            <b-col>
                <label>Wallet Password</label>
                <b-input-group>
                    <b-form-input
                        id="wallet-password-input"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        :disabled="isProcessingImport"
                    >
                    </b-form-input>
                    <b-input-group-append is-text style="cursor: pointer;" @click="showPassword = !showPassword">
                        <b-icon :icon="showPassword ? 'eye' : 'eye-slash'"></b-icon>
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>

        <template v-slot:modal-footer>
            <b-button variant="outline-secondary" @click="$bvModal.hide('wallet-import-modal')" :disabled="isProcessingImport">Cancel</b-button>
            <b-button variant="primary" @click="importClick" :disabled="isProcessingImport">
                <b-spinner v-show="isProcessingImport" label="Loading..." small></b-spinner>
                Import
            </b-button>
        </template>
    </b-modal>
</template>

<script>
export default {
    props: {
        isProcessingImport: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            // form
            form: {
                file: null,
                password: null
            },
            // state
            showPassword: false
        }
    },
    methods: {
        importClick: function() {
            if(this.isProcessingImport) return; // don't process again while importing

            console.log('ImportWallet.vue:importClick', 'importing...')

            let json;
            let reader = new FileReader();

            try {
                reader.onload = (event) => {
                    json = event.target.result;
                    this.$emit('import', json, this.form.password);
                }
                json = reader.readAsText(this.form.file);
            } catch(error) {
                this.createToast('warning', 'Error: Reading file failed');
            }
        }
    }
}
</script>