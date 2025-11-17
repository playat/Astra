<template>
  <div class="relative max-w-[90vw] p-3">
    <div class="overflow-x-scroll" ref="boxRef">
      <div ref="chartContainer" />
    </div>

    <div class="mt-4 flex items-center gap-4 justify-end">
      <YGButton @click="add">记录</YGButton>
      <YGButton @click="addToday">记录今天</YGButton>
      <YGButton @click="exportData" :loading="exportLoading">导出</YGButton>
      <YGButton @click="importData" :loading="importLoading">导入</YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, nextTick } from "vue";
import { LineChart } from "chartist";
import {
  exportPhysiology,
  getPhysiology,
  importPhysiology,
} from "@/api/physiology";
import { ctLabelPlugin, ctValuePlugin } from "@/utils/ChartistPlugin";
import YGButton from "@/components_ui/YGButton.vue";
import AddPhysiology from "../components_system/AddPhysiology.vue";
import CoverDialog from "@/components_ui/CoverDialog";

const chartContainer = ref(null);
let chartInstance = null;
const boxRef = ref(null);
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

  // 格式化数据
  const chartData = processIntervalData(dateList.data);

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

    setTimeout(() => {
      boxRef.value.scrollTo({
        left: boxRef.value.scrollWidth,
        behavior: "smooth",
      });
    }, 100);
  }
};

// 打开添加记录对话框
const add = () => {
  const dialog = new CoverDialog({
    component: h(AddPhysiology, {
      onSuccess() {
        createChart();
        dialog.close();
      },
    }),
  });
  dialog.open();
};

const addToday = () => {
  const dialog = new CoverDialog({
    component: h("div", [
      h("div", () => "已填充今天日期"),
      h(AddPhysiology, {
        isToday: true,
        onSuccess() {
          createChart();
          dialog.close();
        },
      }),
    ]),
  });
  dialog.open();
};

const exportLoading = ref(false);
const exportData = () => {
  exportLoading.value = true;
  exportPhysiology()
    .then((res: { filename: string; blob: Blob }) => {
      // 下载文件
      const url = window.URL.createObjectURL(new Blob([res.blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.filename);
      link.click();
      window.URL.revokeObjectURL(url);
    })
    .finally(() => {
      exportLoading.value = false;
    });
};

const importLoading = ref(false);
const importData = () => {
  importLoading.value = true;
  // 创建隐藏的文件输入元素
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";

  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    importPhysiology(formData).then(() => {
      importLoading.value = false;
      createChart();
    });
  };
  input.click();
};

// 在组件挂载后创建图表
onMounted(() => {
  createChart();
});
</script>

<style scoped>
:deep(.ct-label) {
  color: white;
}

:deep(.ct-end) {
  margin-top: 10px;
}
</style>
