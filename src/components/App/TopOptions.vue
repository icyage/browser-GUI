<template>
    <div class="float-right mt-1">
        <b-button variant="transparent">
            <b-icon 
                :icon="$store.getters.isNodeConnected ? 'shield-check' : 'shield'" 
                :variant="$store.getters.isNodeConnected ? 'success' : 'danger'"
            ></b-icon>
            {{ $store.getters.isNodeConnected ? labels[$store.state.settings.lang].CONNECTED : labels[$store.state.settings.lang].NOT_CONNECTED }}
        </b-button>
        |
        <b-button
            id="btn-help"
            variant="transparent"
        >
            <b-icon icon="question-circle"></b-icon>
        </b-button>
        |
        <b-button
            id="btn-settings"
            variant="transparent"
            to='/settings'
        >
            <b-icon icon="gear"></b-icon>
        </b-button>

        <!-- button tooltips -->
        <b-tooltip target="btn-help" placement="bottom" :title="labels[$store.state.settings.lang].HELP"></b-tooltip>
        <b-tooltip target="btn-settings" placement="bottom" :title="labels[$store.state.settings.lang].SETTINGS"></b-tooltip>
    </div>
</template>