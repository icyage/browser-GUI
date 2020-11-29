<script>
import { Line, mixins } from 'vue-chartjs';
export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['options'],
  watch: {
    options: {
      deep: true,
      handler() {
        // only expect 'ticks.min' to change (update > rerender for animation)
        this.$data._chart.options.scales.xAxes[0].ticks.min = this.options.scales.xAxes[0].ticks.min;
        this.$data._chart.update();
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>