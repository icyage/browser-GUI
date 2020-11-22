<template>
    <div style="width: 200px; height: 120px;">
        <!-- Form -->
        <div v-show="!isSharing && sharedURL === null">
            <b-form-radio-group
                v-model="shareAccess"
                :options="shareOptions"
                button-variant="outline-primary"
                buttons
                class="w-100"
            >
            </b-form-radio-group>

            <b-button @click="share" variant="success" class="mt-3" block>
                <b-icon icon="share"></b-icon>
                Share
            </b-button>

            <div class="text-center text-danger">{{ sharedErrorMsg }}</div>
        </div>

        <!-- Submitting Spinner -->
        <div v-show="isSharing" class="text-center my-5">
            <b-spinner label="Spinning" variant="secondary"></b-spinner>
        </div>

        <!-- response nodes.masq.ai URL -->
        <div v-if="!showSuccess && sharedURL !== null">
            <label class="text-muted">Shared URL</label><br />
            <b-input-group>
                <b-form-input :value="sharedURL" type="text"></b-form-input>
                <!-- shared URL: copy button -->
                <template v-slot:append>
                        <b-button 
                            id="btn-copy-shared-url" 
                            variant="transparent"
                            :data-clipboard-text="sharedURL"
                        >
                            <b-icon icon="files"></b-icon>
                        </b-button>
                </template>
            </b-input-group>
        </div>

        <!-- animated check -->
        <AnimatedCheck v-if="showSuccess" class="mx-auto"></AnimatedCheck>
    </div>
</template>

<script>
import clipboard from 'clipboard/src/clipboard';
import AnimatedCheck from '../common/AnimatedCheck.vue';

export default {
    props: {
        descriptor: {
            type: String,
            required: true
        }
    },
    components: {
        AnimatedCheck
    },
    data() {
        return {
            isSharing: false, // post in progress
            showSuccess: false, // set to true temporarily for animated check
            shareAccess: 'PUBLIC',
            shareOptions: [
                { text: 'Public', value: 'PUBLIC' },
                { text: 'Unlisted', value: 'UNLISTED' }
            ],
            sharedURL: null,
            sharedErrorMsg: null,
        }
    },
    methods: {
        share: async function(){
            this.isSharing = true;

            try {
                //'http://127.0.0.1:8000/api/v0/nodes'
                let resp = await fetch('https://nodes.masq.ai/api/v0/nodes', {
                    method: 'POST',
                    body: JSON.stringify({
                        'descriptor': this.descriptor,
                        'access': this.shareAccess
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                let data = await resp.json();

                if(data.success) {
                    this.showSuccess = true;
                    this.sharedURL = data.url;
                    setTimeout(() => this.showSuccess = false, 1750);
                } else {
                    this.sharedErrorMsg = data.message;
                    //this.controller.log(`Couldn't share descriptor ${data.message}`);
                }
            } catch(error) {
                this.sharedErrorMsg = 'Unknown error';
                //this.controller.log('Error posting (sharing) descriptor to nodes.masq.ai');
                console.error('Error posting (sharing) descriptor to nodes.masq.ai', error.message);
            } finally {
                this.isSharing = false;
            }
        }
    },
    mounted() {
        const cb = new clipboard('#btn-copy-shared-url');
    }
}
</script>