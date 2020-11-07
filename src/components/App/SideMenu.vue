<template>
    <div>
        <!-- logo -->
        <div v-html="logoSmall ? icon : logo" class="logo" :class="{ 'mt-3': logoSmall, 'logo-icon': logoSmall }"></div>

        <div class="mt-3">

            <span :style="{ opacity: logoSmall ? '0.0' : '1.0' }" style="font-weight: bold; font-size: 14px;">MENU</span>

            <b-button 
                v-for="item in menuItems"
                :key="item.label"
                variant="transparent"
                 
                :to="item.to" 
                class="mt-3 py-2 text-left text-truncate"
                style=""
                exact-active-class
                active-class="active"
                block 
            >
                <b-icon :icon="item.icon" class="mx-2"></b-icon>

                <template v-if="!logoSmall">
                    <span>{{ labels[$store.state.settings.lang][item.label] }}</span>

                    <!-- Neighborhood Only: (Mock) Connected Neighbor Count -->
                    <b-badge class="ml-3" v-show="item.label == 'NEIGHBORHOOD' && $store.state.isNodeRunning" variant="primary">3</b-badge>

                    <!-- Wallet Only: Not configured status icon -->
                    <b-icon v-if="item.label == 'WALLET' && !$store.getters.isWalletConfigured" icon="exclamation-circle" variant="warning" class="mx-3"></b-icon>
                </template>
            </b-button>

        </div>

    </div>
</template>

<style scoped>
    .active > .b-icon {
        color: var(--blue);
    }

    .active {
        background: rgb(63, 155, 255, 0.05);
    }

    .logo-icon {
        width: 35px;
        margin: 0 auto;
    }
</style>

<script>
import logo from '../../images/MASQ_Logo_Horizontal_Gold.svg';
import icon from '../../images/logo_icon.svg';

export default {
    props: {
        logoSmall: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            logo,
            icon,
            menuItems: [
                {
                    label: 'DASHBOARD',
                    icon: 'house',
                    to: '/dashboard'
                },
                {
                    label: 'WALLET',
                    icon: 'wallet',
                    to: '/wallet'
                },
                {
                    label: 'NEIGHBORHOOD',
                    icon: 'diagram3',
                    to: '/neighborhood'
                },
            ]
        }
    }
}
</script>

<style scoped>
    * {
        font-size: 18px;
    }

    .logo {
        /*max-height: 30px;*/
    }
</style>