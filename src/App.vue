<template>
<!-- text-daark -->
    <b-container fluid class="h-100">
        <b-row class="h-100">
            <b-col :class="{ 'menu-minimized': isMenuMinimized, 'menu-expanded': !isMenuMinimized }" style="transition: all 0.5s; background-color: rgba(255, 255, 255, 0.03);"> <!-- sm="3" md="3" lg="3" xl="2" -->
                <SideMenu :logo-small="isMenuMinimized"></SideMenu>
                <b-icon :icon="isMenuMinimized ? 'arrow-right-circle' : 'arrow-left-circle'" class="menu-minimize-toggle-icon" @click="isMenuMinimized = !isMenuMinimized"></b-icon>
                
                <div :title="$store.getters.targetConnection" class="ml-3 mb-3 text-muted text-truncate connection-indicator" :style="{ width: isMenuMinimized ? '75px' : 'auto' }">
                    <b-icon icon="circle-fill" :variant="$store.getters.anyConnection ? 'success' : 'warning'" class="mr-1"></b-icon>
                    {{ $store.getters.targetConnection }}
                </div>
            </b-col>
            <!-- bg-light -->
            <b-col class="h-100" style="overflow-y: scroll; overflow-x: hidden; background-color: rgba(0, 0, 0, 0.03);"> <!-- sm="9" md="9" lg="9" xl="10"> -->
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
        
    </b-container>
</template>

<style>
    .b-toaster-bottom-left {
        margin-bottom: 35px !important;
    }
</style>
<style scoped>
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
        return {
            isMenuMinimized: false
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