<template>
    <b-card>
        <h4>{{ labels[$store.state.settings.lang].SESSION_ACTIVITY }}</h4>
        <AcivityChart ref="chart_component" :chartData="chartData" :options="options" style="height: 180px" class="mt-3"></AcivityChart>
    </b-card>
</template>

<script>
import AcivityChart from './ActivityChart.vue';

export default {
    data() {
        return {
            maxDataPoints: 30,
            chartData : {
                labels: [],
                datasets: [
                    {
                        label: 'Credit',
                        backgroundColor: 'rgba(53, 229, 57, 0.3)',
                        borderColor: 'rgb(0,255,0)',
                        borderWidth: 2,
                        data: []
                    },
                    {
                        label: 'Debt',
                        backgroundColor: 'rgba(229, 57, 53, 0.3)',
                        borderColor: 'rgb(255,0,0)',
                        borderWidth: 2,
                        data: []
                    }
                ]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    xAxes: [{
                        display: false,
                        ticks: {
                            min: null,
                        }
                    }],
                    yAxes: [{
                        display: false
                    }],
                },
                elements: {
                    point:{
                        radius: 1
                    }
                },
                animation: {
                    duration: 1000,
                }
            },
            // mock only
            mockMode: false,
            fakeDataInterval: null,
        }
    },
    methods: {
        clearChart: function() {
            let tmp = {...this.chartData};

            tmp.labels = [];
            tmp.datasets[0].data = [];
            tmp.datasets[1].data = [];

            this.chartData = tmp;
        },
        updateChart: function() {
            let newCreditPoint;
            let newDebtPoint;
            let tmp = {...this.chartData};
            let tmpOpt = {...this.options};

            tmp.labels = [...this.$store.state.session.financials.timesPolled];
            tmp.datasets[0].data = [...this.$store.state.session.financials.credit];
            tmp.datasets[1].data = [...this.$store.state.session.financials.debt];

            tmpOpt.scales.xAxes[0].ticks.min = tmp.labels[Math.max(0, tmp.labels.length - this.maxDataPoints + 1)]; // update min time to display (show last 30 points)

            this.chartData = tmp;
            this.options = tmpOpt;
        },
        mockDataChart: function() {
            this.fakeDataInterval = setInterval(() => {

                this.$store.commit('appendFinancials', {
                    time: + new Date(),
                    credit: Math.random(),
                    debt: Math.random() * 2
                });

            }, 2000);
        }
    },
    components: {
        AcivityChart
    },
    watch: {
        "$store.state.session.financials": {
            deep: true,
            handler() {
                this.updateChart();
            }
        }
    },
    mounted() {
        this.gradient = this.$refs.chart_component.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450)
        this.gradient2 = this.$refs.chart_component.$refs.canvas.getContext('2d').createLinearGradient(0, 0, 0, 450)

        this.gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
        this.gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
        this.gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        this.gradient2.addColorStop(0, 'rgba(0, 255, 0, 0.9)')
        this.gradient2.addColorStop(0.5, 'rgba(0, 255, 0, 0.25)');
        this.gradient2.addColorStop(1, 'rgba(0, 255, 0, 0)');

        this.chartData.datasets[0].backgroundColor = this.gradient2;
        this.chartData.datasets[1].backgroundColor = this.gradient;

        this.updateChart();

        if(this.mockMode) this.mockDataChart();
    },
    beforeDestroy() {
        if(this.mockMode) clearInterval(this.fakeDataInterval);
    }
}
</script>