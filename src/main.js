import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import { Network } from 'vue-vis-network';

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.component('network', Network);

import '@forevolve/bootstrap-dark/dist/css/toggle-bootstrap.min.css';
import '@forevolve/bootstrap-dark/dist/css/toggle-bootstrap-dark.min.css';
//import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// views
import App from './App.vue';
import Dashboard from './views/Dashboard.vue';
import Settings from './views/Settings.vue';
import Neighborhood from './views/Neighborhood.vue';
import Wallet from './views/Wallet.vue';

// labels+translations
import StateStore from './js/StateStore.js';
import { labels } from './js/locales.js';
import { Controller } from './js/Controller.js';
import { Utils } from './js/utils.js';
import { defaults } from './js/defaults.js';
import Assistant from './js/Assistant/Assistant.js';

const controller = new Controller();
const assistant = new Assistant();

// add vuex plugins
StateStore.plugins = [
    controller.plugin.bind(controller), 
    assistant.plugin.bind(assistant)
];

const store = new Vuex.Store(StateStore);

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/settings', component: Settings },
    { path: '/neighborhood', component: Neighborhood },
    { path: '/wallet', component: Wallet }

]
const router = new VueRouter({
    routes
});

Vue.mixin ({
    data() {
        return {
            labels,
            //store,
            //storage: new Storage(),
            utils: Utils,
            defaults,
            createToast: function(type, message) {
                let variant = type;
                //let location = store.state.session.assistant.showBody ? 'b-toaster-bottom-center' : 'b-toaster-bottom-right';
                //let mb = store.state.session.assistant.showBody ? 'mb-2' : 'mb-5';
                this.$bvToast.toast(`${message}`, {
                    autoHideDelay: 5000,
                    toaster: 'b-toaster-bottom-left',
                    toastClass: [`border-${variant}`, 'bg-transparent', `text-${variant}`, 'mr-5', 'pr-5', 'd-inline-block'],
                    noCloseButton: true,
                });
            }
        }
    }
});

const app = new Vue({
    el: '#app',
    store,
    data() {
        return {
            controller,
        }
    },
    router,
    render: h => h(App),
    methods: {
        applyTheme() {
            if(this.$store.state.settings.theme == 'light') {
                document.body.classList.remove('bootstrap-dark');
                document.body.classList.add('bootstrap');
            } else {
                document.body.classList.remove('bootstrap');
                document.body.classList.add('bootstrap-dark');
            }
        }
    },
    watch: {
        // leaving this here for now due to it's view interaction
        "$store.state.settings.theme": function() {
            this.applyTheme();
        },
    },
    beforeMount() {
        this.applyTheme();
    }
});

store.$app = app; // expose root vue instance to store (primarily for toast messages)