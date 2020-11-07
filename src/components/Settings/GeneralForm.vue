<template>
    <div>
        <b-list-group>
            <b-list-group-item>

                <!-- Theme -->
                <b-row>
                    <b-col cols="6">
                        <h5>Theme</h5>
                        <p>Select a theme</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-select class="mt-3" v-model="theme" :options="themeOptions"></b-form-select>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Language -->
                <b-row>
                    <b-col cols="6">
                        <h5>Display Language</h5>
                        <p>Set the language to display</p>
                    </b-col>
                    <b-col cols="6">
                        <b-form-select class="mt-3" v-model="lang" :options="langOptions"></b-form-select>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Daemon Port -->
                <b-row>
                    <b-col>
                        <h5>Daemon Port</h5>
                        <p>WebSocket port of your daemon service <i class="text-muted">(refresh required)</i></p>
                    </b-col>
                    <b-col>
                        <b-form-input class="mt-3" v-model.number="daemonPort"></b-form-input>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Enable zero-hop mode -->
                <b-row>
                    <b-col>
                        <h5>Enable Zero-Hop</h5>
                        <p>Zero-hop neighborhood mode is good for testing</p>
                    </b-col>
                    <b-col>
                        <b-form-checkbox class="mt-3" v-model="enableZeroHop" switch size="lg"></b-form-checkbox>
                    </b-col>
                </b-row>
            </b-list-group-item>

            <b-list-group-item>
                <!-- Enable/Disable Assistant -->
                <b-row>
                    <b-col>
                        <h5>Enable Assistant</h5>
                        <p>The AI Assistant can help with some common problems</p>
                    </b-col>
                    <b-col>
                        <b-form-checkbox class="mt-3" v-model="enableAssistant" switch size="lg"></b-form-checkbox>
                    </b-col>
                </b-row>
            </b-list-group-item>

        </b-list-group>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // options
            themeOptions: [
                { value: 'light', text: 'Light' },
                { value: 'dark', text: 'Dark' }
            ],
            langOptions: [
                { value: 'en', text: 'English' }
            ]
        }
    },
    computed: {
        theme: {
            get() {
                return this.$store.state.settings.theme;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'theme',
                    value
                });
            }
        },
        lang: {
            get() {
                return this.$store.state.settings.lang;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'lang',
                    value
                });
            }
        },
        enableZeroHop: {
            get() {
                return this.$store.state.settings.enableZeroHop;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'enableZeroHop',
                    value
                });
            }
        },
        daemonPort: {
            get() {
                return this.$store.state.settings.daemonPort;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'daemonPort',
                    value
                });
            }
        },
        enableAssistant: {
            get() {
                return this.$store.state.settings.enableAssistant;
            },
            set(value) {
                this.$store.commit('updateSettings', {
                    name: 'enableAssistant',
                    value
                })
            }
        }
    }
}
</script>