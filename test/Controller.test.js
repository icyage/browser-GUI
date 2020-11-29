import Vue from 'vue';
import Vuex from 'vuex';
import StateStore from '../src/js/StateStore.js';
import { Controller } from '../src/js/Controller.js';
Vue.use(Vuex);

const controller = new Controller();

// add controller as Vuex plugin
StateStore.plugins = [
    controller.plugin.bind(controller), 
];

let store = new Vuex.Store(StateStore);

// mocks (ignore)
// $app
store.$app = {
    createToast: () => {}
}
// controller
controller._messenger = {
    connect: () => {},
    send: () => {}
}

describe('Controller.js', () => {
    let nodePort = 1234;

    test('onOpen daemon WebSocket connected', () => {
        controller.onOpen({target: { url: `ws://localhost:${store.state.settings.daemonPort}` } });
        expect(store.state.session.websocket['daemon'].isConnected).toBeTruthy();
        expect(store.state.isNodeStarting).toBeFalsy();
        expect(store.getters.anyConnection).toBeTruthy();
    })

    test('onOpen node WebSocket connected', () => {
        controller.onOpen({target: { url: `ws://localhost:${nodePort}` } });
        expect(store.state.session.websocket['node'].isConnected).toBeTruthy();
        expect(store.state.session.websocket.node.port).toBe(nodePort.toString());
        expect(store.state.isNodeStarting).toBeFalsy();
        expect(store.state.isNodeRunning).toBeTruthy();
        expect(store.getters.anyConnection).toBeTruthy();
    })

    test('onClose node WebSocket disconnected', () => {
        controller.onClose({target: { url: `ws://localhost:${nodePort}` } });
        expect(store.state.session.websocket['node'].isConnected).toBeFalsy();
        expect(store.state.session.websocket.node.port).toBe(nodePort.toString());
        expect(store.state.isNodeStarting).toBeFalsy();
        expect(store.state.isNodeRunning).toBeFalsy();
    })

    test('1/2 connections closed, store.getters.anyConnection should still be true', () => {
        expect(store.getters.anyConnection).toBeTruthy();
    })

    test('onClose daemon WebSocket disconnected', () => {
        controller.onClose({target: { url: `ws://localhost:${store.state.settings.daemonPort}` } });
        expect(store.state.session.websocket['daemon'].isConnected).toBeFalsy();
        expect(store.state.isNodeStarting).toBeFalsy();
    })

    test('all connections now closed, store.getters.anyConnection should return false', () => {
        expect(store.getters.anyConnection).toBeFalsy();
    })
})