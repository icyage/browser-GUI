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
            maxDataPoints: 15,
            chartData : {
                labels: new Array(15).map((x, i) => i),
                datasets: [
                    {
                        label: 'Credit',
                        backgroundColor: 'rgba(53, 229, 57, 0.3)',
                        borderColor: 'rgb(0,255,0)',
                        borderWidth: 2,
                        data: new Array(15).fill(0)
                    },
                    {
                        label: 'Debt',
                        backgroundColor: 'rgba(229, 57, 53, 0.3)',
                        borderColor: 'rgb(255,0,0)',
                        borderWidth: 2,
                        data: new Array(15).fill(0)
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
                    duration: 0,
                }
            },
            lastCredit: 0,
            lastDebt: 0,
            // mock only
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
            tmp.labels = [...this.$store.state.session.financials.timesPolled];
            tmp.datasets[0].data = [...this.$store.state.session.financials.credit];
            tmp.datasets[1].data = [...this.$store.state.session.financials.debt];

            // START: mock
            /*
            newCreditPoint = this.$store.getters.credit - this.lastCredit;
            newDebtPoint = this.$store.getters.debt - this.lastDebt;
            this.lastCredit = this.$store.getters.credit;
            this.lastDebt = this.$store.getters.debt;

            tmp.labels.push(tmp.labels.slice(-1)[0] + 1)
            tmp.datasets[0].data.push(newCreditPoint);
            tmp.datasets[1].data.push(newDebtPoint);
            */
            // END: Mock

            // enforce max data points
            if(tmp.labels.length > this.maxDataPoints) {
                let over = tmp.labels.length % this.maxDataPoints;
                // labels
                tmp.labels = tmp.labels.slice(over);
                // credit
                tmp.datasets[0].data = tmp.datasets[0].data.slice(over);
                // debt
                tmp.datasets[1].data = tmp.datasets[1].data.slice(over);
            }

            this.chartData = tmp;
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
        },
        "$store.state.isNodeRunning": function() {
            if(1==1) return; // NO LONGER MOCKING
            this.clearChart();

            if(this.$store.state.isNodeRunning) {
                // temp chart mocking
                let intervalCount = 0;
                this.fakeDataInterval = setInterval(() => {
                    let tmp = {...this.chartData};

                    tmp.labels.push(intervalCount);
                    tmp.datasets[0].data.push(Math.random());
                    tmp.datasets[1].data.push(Math.random() * 2);

                    // enforce max data points
                    if(tmp.labels.length > this.maxDataPoints) {
                        let over = tmp.labels.length % this.maxDataPoints;
                        // labels
                        tmp.labels = tmp.labels.slice(over);
                        // credit
                        tmp.datasets[0].data = tmp.datasets[0].data.slice(over);
                        // debt
                        tmp.datasets[1].data = tmp.datasets[1].data.slice(over);
                    }


                    this.chartData = tmp;

                    intervalCount++;

                }, 1000);
            } else {
                // node turned off
                clearInterval(this.fakeDataInterval);

                // place some dummy values for straight lined chart as placeholder
                let tmp = {...this.chartData};

                tmp.labels = [1, 2];
                tmp.datasets[0].data = [];
                tmp.datasets[1].data = [1, 1];

                this.chartData = tmp;
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
    }
}
</script>