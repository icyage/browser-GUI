<template>
    <b-card>
        <div class="float-right">
            <b-link :href="addressLink" target="_blank">
                <b-icon icon="box-arrow-up-right"></b-icon>
            </b-link>
        </div>
        <h4>{{ name }} Address</h4>
        <div ref="hashicon" class="mt-3"></div>
        <span class="mt-3 d-inline-block">{{ address }}</span>
    </b-card>
</template>

<script>
// vendor
import hashicon from 'hashicon';

export default {
    props: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    computed: {
        addressLink: function() {
            let isRopsten = this.$store.state.node.setup['chain'].value != 'mainnet';
            return `https://${isRopsten ? 'ropsten.' : ''}etherscan.io/address/${this.address}`
        }
    },
    watch: {
        address: function() {
            this.$refs.hashicon.innerHTML = "";
            this.$refs.hashicon.appendChild(this.generateHashIcon());
        },
        "$store.state.node.setup": function(newSetup, oldSetup) {
            if(newSetup['earning-wallet'] != oldSetup['earning-wallet']) {
                this.generateHashIcon();
            }
        }
    },
    methods: {
        generateHashIcon: function() {
            return hashicon(this.address);
        }
    },
    mounted() {
        this.$refs.hashicon.appendChild(this.generateHashIcon());
    }
}
</script>