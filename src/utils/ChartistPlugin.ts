// 格式化x轴label
export const ctLabelPlugin = function (labels) {
  return function (chart) {
    // 等待图表渲染完成
    chart.on("created", function (context) {
      // 获取所有X轴标签元素
      const labelElements =
        context.svg._node.querySelectorAll(".ct-labels .ct-end");
      // 替换为HTML内容
      labelElements.forEach((el, index) => {
        el.style.display = "block";
        // el.style.textAlign = "center";
        el.style.height = "auto";
        const labelArr = labels[index].split(" ~ ");
        const start = labelArr[0].split("-");
        const end = labelArr[1].split("-");
        el.innerHTML = `
          <p style="height: 1rem;">${start[0]}-<span style="font-weight: bold;color: var(--yg-color)">${start[1]}</span>-${start[2]}</p>
          <p style="height: 1rem;">至</p>
          <p style="height: 1rem;">${end[0]}-<span style="font-weight: bold;color: var(--yg-color)">${end[1]}</span>-${end[2]}</p>
        `;
      });
    });
  };
};

// 封装一个通用的"显示数值"插件
export function ctValuePlugin() {
  return function (chart) {
    chart.on("draw", function (context: any) {
      if (context.type === "point") {
        // // 2. 获取当前数据点的坐标（x: 水平位置, y: 垂直位置）
        const x = context.x;
        const y = context.y;

        // // 3. 获取当前数据点的数值（context.raw 即原始数据值）
        const value = context.element._node.attributes["ct:value"].value;

        // // 4. 创建 SVG 文本元素（用于显示数值）
        const textElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        textElement.setAttribute("fill", "#FFFFFF"); // 设置文本颜色为白色
        textElement.setAttribute("font-size", "12px"); // 设置字体大小
        // 将x位置调整到数据点的中心
        textElement.setAttribute("text-anchor", "middle");
        // 5. 设置文本元素的属性（位置、内容、样式）
        textElement.setAttribute("x", x); // 水平位置与数据点一致
        textElement.setAttribute("y", String(y - 10)); // 垂直位置：在数据点上方10px（避免重叠）
        textElement.textContent = value; // 文本内容为数据值

        // // 6. 将文本元素插入到图表的 SVG 容器中
        context.group._node.appendChild(textElement);
      }
    });
  };
}
