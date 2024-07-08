<template>
  <div :style="{ width: chartWidth, height: chartHeight }" ref="chartRef"></div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'ECharts',
  props: {
    chartWidth: {
      type: String,
      default: '90%'
    },
    chartHeight: {
      type: String,
      default: '300px'
    },
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref(null);
    let myChart = null;

    const updateChartOptions = () => {
      // 提取 drugName 和 stock 数据
      const drugNames = props.data.map(item => item.drugName);
      const stocks = props.data.map(item => item.stock);

      const chartOptions = {
        title: {
          text: 'SLY Add',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: drugNames,
          axisLabel: {
            interval: 0,
            rotate: 30 // 可选：旋转标签以避免重叠
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Stock',
            type: 'bar',
            data: stocks,
            itemStyle: {
              color: '#61a0a8' // 设置柱状图颜色
            }
          }
        ]
      };

      // 设置图表选项
      const chartDom = chartRef.value;
      if (myChart) {
        myChart.dispose(); // 销毁旧实例
      }
      myChart = echarts.init(chartDom);
      myChart.setOption(chartOptions);
    };

    // 在组件挂载时更新图表
    onMounted(() => {
      updateChartOptions();
    });

    // 监听数据变化，动态更新图表
    watch(() => props.data, () => {
      updateChartOptions();
    });

    return {
      chartRef
    };
  }
};
</script>

<style scoped>
/* 你可以根据需要添加样式 */
</style>
