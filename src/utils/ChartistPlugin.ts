export const ctLabelPlugin = function (labels) {
  return function (chart) {
    // 等待图表渲染完成
    chart.on("created", function (context) {
      // 获取所有X轴标签元素
      const labelElements =
        context.svg._node.querySelectorAll(".ct-labels .ct-end");
      console.log(context.svg._node, labelElements);

      // 替换为HTML内容
      labelElements.forEach((el, index) => {
        el.style.display = "block";
        // el.style.textAlign = "center";
        el.style.height = "auto";
        const labelArr = labels[index].split(" ~ ");
        el.innerHTML = `
          <p style="height: 1rem;">${labelArr[0]}</p>
          <p style="height: 1rem;">至</p>
          <p style="height: 1rem;">${labelArr[1]}</p>
        `;
      });
    });
  };
};
