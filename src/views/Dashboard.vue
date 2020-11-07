<template>
    <div>
        <b-row class="mb-4">
            <b-col>
                <h2>{{ labels[$store.state.settings.lang].DASHBOARD }}</h2>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <NodeDirectives></NodeDirectives>
            </b-col>
        </b-row>

        <b-row class="mt-4">
            <b-col>
                <StatCards></StatCards>
            </b-col>
        </b-row>

        <b-row class="mt-4">
            <b-col>
                <FinancialActivity></FinancialActivity>
            </b-col>
        </b-row>
    </div>
</template>

<script>
import StatCards from '../components/Dashboard/StatCards.vue';
import FinancialActivity from '../components/Dashboard/FinancialActivity.vue';
import NodeDirectives from '../components/Dashboard/NodeDirectives.vue';

export default {
    components: {
        StatCards,
        FinancialActivity,
        NodeDirectives
    }
}
</script>