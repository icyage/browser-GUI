<template>
    <b-card-group deck>
        <b-card>
            <b-card-text class="text-center">
                <h4>{{ labels[$store.state.settings.lang].BALANCE }}</h4>
                <b-row>
                    <!-- Masq Balance -->
                    <b-col>
                        <div v-html="icon" class="d-inline-block mr-1" style="width: 25px;"></div>
                        {{ masq }}
                    </b-col>
                    <!-- Ethereum Balance -->
                    <b-col>
                        <div v-html="ethLogo" class="d-inline-block mr-1" style="width: 25px;"></div>
                        {{ eth }}
                    </b-col>
                </b-row>

                <!-- refresh button -->
                <b-icon @click="refreshBalance" icon="arrow-clockwise" class="refresh-balance-btn m-2 text-muted"></b-icon>
            </b-card-text>
        </b-card>
        <b-card>
            <b-card-text class="text-center">
                <h4>{{ labels[$store.state.settings.lang].CREDIT }}</h4>
                <div>{{ $store.getters.credit.toFixed(5) }}</div>
            </b-card-text>
        </b-card>
        <b-card>
            <b-card-text class="text-center">
                <h4>{{ labels[$store.state.settings.lang].DEBT }}</h4>
                <div>{{ $store.getters.debt.toFixed(5) }}</div>
            </b-card-text>
        </b-card>
    </b-card-group>
</template>

<script>
import icon from '../../images/logo_icon.svg';
import ethLogo from '../../images/Ethereum_logo_2014_sqr.svg';

export default {
    data() {
        return {
            ethLogo, // eth logo svg
            icon, // masq logo svg
        }
    },
    methods: {
        refreshBalance: async function() {
            console.log('StatCards.vue:refreshBalance');
            this.$store.dispatch('updateBalances');
        }
    },
    computed: {
        eth: function() {
            return this.$store.state.session.financials.ethBalance !== null ? this.$store.state.session.financials.ethBalance.toFixed(5) : '--';
        },
        masq: function() {
            return this.$store.state.session.financials.masqBalance !== null ? this.$store.state.session.financials.masqBalance.toFixed(2) : '--';
        }
    }
}
</script>

<style scoped>
    .refresh-balance-btn {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 1.3rem;
        opacity: 0;
        cursor: pointer;
        transition: all 0.5s;
    }

    .card-body:hover .refresh-balance-btn, .refresh-balance-btn:hover {
        opacity: 1.0;
    }

</style>