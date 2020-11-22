<template>
<!-- text-daark -->
    <b-container fluid class="h-100">
        <b-row class="h-100">
            <b-col class="h-100" :class="{ 'pt-3': $store.state.isElectron, 'menu-minimized': menuMinimized, 'menu-expanded': !menuMinimized }" style="transition: all 0.5s; background-color: rgba(255, 255, 255, 0.03);"> <!-- sm="3" md="3" lg="3" xl="2" -->
                <SideMenu :logo-small="menuMinimized"></SideMenu>
                <b-icon :icon="menuMinimized ? 'arrow-right-circle' : 'arrow-left-circle'" class="menu-minimize-toggle-icon" @click="menuMinimized = !menuMinimized"></b-icon>
                
                <div :title="$store.getters.targetConnection" class="ml-3 mb-3 text-muted text-truncate connection-indicator" :style="{ width: menuMinimized ? '75px' : 'auto' }">
                    <b-icon icon="circle-fill" :variant="$store.getters.anyConnection ? 'success' : 'warning'" class="mr-1"></b-icon>
                    {{ $store.getters.targetConnection }}
                </div>
            </b-col>
            <!-- bg-light -->
            <b-col class="h-100" :class="{ 'pt-2': $store.state.isElectron }" style="overflow-y: scroll; overflow-x: hidden; background-color: rgba(0, 0, 0, 0.03);"> <!-- sm="9" md="9" lg="9" xl="10"> -->
                <b-row>
                    <b-col>
                        <TopOptions></TopOptions>
                    </b-col>
                </b-row>
                <div class="px-4">
                    <router-view></router-view>
                </div>
            </b-col>
        </b-row>

        <Assistant></Assistant>

        <!-- Electron window draggable hidden element helper -->
        <div class="electron-draggable-bar"></div>
        
    </b-container>
</template>

<style>
    .b-toaster-bottom-left {
        margin-bottom: 35px !important;
    }

    /* Dark mode fixes */
    body.bootstrap-dark .popover-body {
        border: 1px solid #3d4044;
        border-radius: 3px;
        background: #212529;
    }
    body.bootstrap-dark .arrow::after {
        border-left-color: #3d4044 !important;
    }
</style>
<style scoped>
    .electron-draggable-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 75vw;
        height: 50px;
        -webkit-app-region: drag;
    }

    .connection-indicator {
        position:absolute;
        bottom: 0; 
        left: 0; 
        font-size: 0.85rem;
    }
    .menu-minimized {
        -ms-flex: 0 0 100px;
        flex: 0 0 100px;
    }
    .menu-expanded {
        -ms-flex: 0 0 240px;
        flex: 0 0 240px;
    }
    .menu-minimize-toggle-icon {
        position: absolute;
        top: 55px;
        right: -15px;
        font-size: 30px;
        opacity: 0;
        transition: all 0.5s;
        z-index: +3;
        cursor: pointer;
    }

    div:hover > .menu-minimize-toggle-icon, .menu-minimize-toggle-icon:hover {
        opacity: 1.0;
        color: var(--blue);
    }
</style>

<script>
import TopOptions from './components/App/TopOptions.vue';
import SideMenu from './components/App/SideMenu.vue';
import Assistant from './components/App/Assistant.vue';

export default {
    data() {
        return { }
    },
    computed: {
        menuMinimized: {
            get() {
                return this.$store.state.settings.menuMinimized;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'menuMinimized',
                    value: value
                })
            }
        }
    },
    mounted() {
        this.$store.commit('onLoad');
    },
    components: {
        TopOptions,
        SideMenu,
        Assistant
    }
}
</script>