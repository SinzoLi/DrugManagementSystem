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
      // 按 drugName 分组数据
      const groupedData = props.data.reduce((acc, item) => {
        if (!acc[item.drugName]) {
          acc[item.drugName] = [];
        }
        acc[item.drugName].push({
          date: item.date,
          stock: item.stock
        });
        return acc;
      }, {});

      // 提取所有的 date 作为 x 轴的数据，并排序
      const allDates = [...new Set(props.data.map(item => item.date))].sort();

      // 构造 series 数据
      const seriesData = Object.keys(groupedData).map(drugName => ({
        name: drugName,
        type: 'line',
        data: allDates.map(date => {
          const found = groupedData[drugName].find(d => d.date === date);
          return found ? found.stock : 0; // 如果没找到相应的 date，则返回 0
        })
      }));

      const chartOptions = {
        title: {
          text: 'SLY Consume',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: function (params) {
            let tooltipText = `${params[0].axisValue}<br/>`;
            params.forEach(param => {
              tooltipText += `${param.marker}${param.seriesName}: ${param.data}<br/>`;
            });
            return tooltipText;
          }
        },
        legend: {
          orient: 'horizontal', // 水平布局
          bottom: '0%', // 图例放在底部
          textStyle: {
            fontSize: 16 // 设置图例字体大小
          },
          selectedMode: 'multiple', // 多选模式
          data: Object.keys(groupedData) // 自动生成图例数据
        },
        grid: {
          left: '10%',
          right: '4%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: allDates
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: seriesData
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
