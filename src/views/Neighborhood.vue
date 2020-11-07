<template>
    <div>
        <b-row class="mb-4">
            <b-col>
                <h2>{{ labels[$store.state.settings.lang].NEIGHBORHOOD }}</h2>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-card>
                    <network ref="network"
                        :nodes="nodes"
                        :edges="edges"
                        :options="options"
                    >
                    </network>
                </b-card>
                <i class="text-muted">NOTE: Currently synthetic data (not real)</i>
            </b-col>
        </b-row>
    </div>
</template>

<script>
// https://www.npmjs.com/package/vue-vis-network
export default {
    data() {
        return {
            nodes: [
                {id: 2,  label: '49.75.183.86:9175', shape: 'dot', color: '#491bad'},
                {id: 5,  label: 'You', shape: 'hexagon', color: '#cd8e31'},
                {id: 6,  label: '197.179.239.119:8873', shape: 'dot', color: '#491bad'},
                {id: 7,  label: '109.66.56.226:6293', shape: 'dot', color: '#491bad'},
            ],
            edges: [
                {from: 2, to: 5}, 
                {from: 5, to: 6},
                {from: 5, to: 7},
            ],
            options: {
                height: '500px',
                nodes: {
                    borderWidth: 4,
                    font: '14px arial white'
                },
                edges: {
                    color: 'lightgray'
                }
            }
        }
    },
    mounted() {
        //console.log('Neighborhood.vue:(mounted)', this.store.settings.theme);
        this.options.nodes.font = (this.$store.state.settings.theme == 'light') ? '14px arial black' : '14px arial white';
    }
}
</script>