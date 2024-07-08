<template>
  <div ref="chartRef" :style="{ width: chartWidth, height: chartHeight }"></div>
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
      // 将传入的数据转换为 ECharts 需要的格式
      const seriesData = props.data.map(item => ({
        value: item.stock,
        name: item.drugName,
        date: item.date
      }));

      const chartOptions = {
        title: {
          text: 'W1 Consume',
          left: 'center',
          textStyle: {
            fontSize: 20 // 设置标题字体大小
          }
        },
        tooltip: {
          trigger: 'item',
          textStyle: {
            fontSize: 16 // 设置提示框字体大小
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: {
            fontSize: 16 // 设置图例字体大小
          }
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: seriesData,
            label: {
              show: true,
              fontSize: 16 // 设置标签字体大小
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
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
}
</script>
