<template>
    <div>
        <b-row class="mb-4">
            <b-col>
                <h2>{{ labels[$store.state.settings.lang].SETTINGS }} </h2>
            </b-col>
        </b-row>
        
        <b-tabs pills class="pt-3 mb-3">
            <b-tab title="General" class="mt-3" active>
                <GeneralForm></GeneralForm>
            </b-tab>
            <b-tab title="Advanced" class="mt-3">
                <AdvancedForm></AdvancedForm>
            </b-tab>
            <b-tab title="UI Log" class="mt-3">
                <b-card>
                    <h5 v-if="!$store.getters.logs.length" class="text-muted">Nothing here</h5>
                    <p v-html="$store.getters.logs" class="log"></p>
                </b-card>
            </b-tab>
        </b-tabs>

        <b-row class="mb-5">
            <b-col class="text-right text-muted">
                GUI Version: {{ GUI_VERSION }}
            </b-col>
        </b-row>

    </div>
</template>

<style scoped>
    .log {
        font-size: 0.9rem;
        font-family: "Lucida Console", Monaco, monospace;
        max-height: 50vh;
        overflow: scroll;
    }
</style>

<script>
import AdvancedForm from '../components/Settings/AdvancedForm.vue';
import GeneralForm from '../components/Settings/GeneralForm.vue';

export default {
    data() {
        return {
            GUI_VERSION: GUI_VERSION
        }
    },
    components: {
        AdvancedForm,
        GeneralForm
    }
}
</script>