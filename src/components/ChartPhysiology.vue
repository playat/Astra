<template>
  <div class="w-[700px] relative">
    <div class="overflow-x-scroll">
      <div ref="chartContainer" />
    </div>

    <div class="absolute top-3 right-3">
      <YGButton @click="add">记录</YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { LineChart, plugins } from "chartist";
import { getPhysiology } from "@/api/physiology";
import { ctLabelPlugin, ctValuePlugin } from "@/utils/ChartistPlugin";
import YGButton from "@/components_ui/YGButton.vue";
import AddPhysiology from "./AddPhysiology.vue";
import useDialog from "@/hooks/useDialog";
const chartContainer = ref(null);
let chartInstance = null;
const dialog = useDialog();
const processIntervalData = (dateList: any) => {
  const labels = [];
  const series = [];
  if (Array.isArray(dateList)) {
    // 遍历相邻日期对（从第1个到倒数第2个）
    for (let i = 0; i < dateList.length - 1; i++) {
      const startDate = new Date(dateList[i].happen).getTime();
      const endDate = dateList[i + 1]
        ? new Date(dateList[i + 1].happen).getTime()
        : Date.now();
      // 计算天数差（毫秒转天：1天 = 24*60*60*1000ms）
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      series.push(daysDiff);
      //标签
      const label = `${dateList[i].happen} ~ ${
        dateList[i + 1]?.happen || "至今"
      }`;
      labels.push(label);
    }
  }

  return {
    labels,
    series: [series],
  };
};

// 创建图表
const createChart = async () => {
  const dateList = await getPhysiology();
  // 只取最近6个数据进行处理
  const chartData = processIntervalData(dateList.data);
  console.log(chartData);

  if (chartContainer.value) {
    // 销毁已存在的图表实例
    if (chartInstance) {
      chartInstance.detach();
    }

    // 创建新的柱状图实例
    chartInstance = new LineChart(chartContainer.value, chartData, {
      width: chartData.labels.length * 80,
      height: 300,
      axisX: {
        offset: 60,
        // showGrid: false, // 隐藏X轴网格线
        labelOffset: {
          // x: -45,
        },
      },
      showArea: true,
      axisY: {
        offset: 0,
        showLabel: false,
      },
      chartPadding: {
        top: 30,
        left: 40,
        right: 40,
      },
      plugins: [ctLabelPlugin(chartData.labels), ctValuePlugin()],
    });
  }
};

// 打开添加记录对话框
const add = () => {
  dialog.open({
    component: AddPhysiology,
  });
};

// 在组件挂载后创建图表
onMounted(createChart);
</script>

<style scoped>
:deep(.ct-label) {
  color: white;
}

:deep(.ct-end) {
  margin-top: 10px;
}
</style>
