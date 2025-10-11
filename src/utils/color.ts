/**
 * 生成随机淡色
 * 返回形如 #RRGGBB 的十六进制颜色字符串，亮度较高（偏淡）
 */
export const getRandomLightColor = (): {
  r: number;
  g: number;
  b: number;
} => {
  const base = 200; // 控制最小亮度，值越大颜色越淡
  const r = Math.floor(Math.random() * 56 + base); // 200-255
  const g = Math.floor(Math.random() * 56 + base);
  const b = Math.floor(Math.random() * 56 + base);
  return {
    r,
    g,
    b,
  };
};
/**
 * 根据传入的 rgb 值生成反色
 * @param r 红色通道值 0-255
 * @param g 绿色通道值 0-255
 * @param b 蓝色通道值 0-255
 * @returns 反色后的 rgba 字符串
 */
export const getInvertColor = ({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): string => {
  const invR = 255 - r;
  const invG = 255 - g;
  const invB = 255 - b;
  return `rgba(${invR}, ${invG}, ${invB}, 1)`;
};
