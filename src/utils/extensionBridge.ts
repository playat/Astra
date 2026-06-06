/**
 * 浏览器插件通信桥
 * 通过 CustomEvent 与浏览器插件的 content script 通信
 * 用于绕过浏览器弹窗拦截，由插件批量创建标签页
 */

const PING_EVENT = "astra:ping";
const PONG_EVENT = "astra:pong";
const OPEN_TABS_EVENT = "astra:open-tabs";

let extensionDetected: boolean | null = null;
let detectPromise: Promise<boolean> | null = null;

/**
 * 检测浏览器插件是否已安装
 * 通过 ping/pong 握手机制判断
 */
export function detectExtension(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const onPong = () => {
      document.removeEventListener(PONG_EVENT, onPong);
      extensionDetected = true;
      resolve(true);
    };
    document.addEventListener(PONG_EVENT, onPong);
    document.dispatchEvent(new CustomEvent(PING_EVENT));

    setTimeout(() => {
      if(!extensionDetected) {
        document.removeEventListener(PONG_EVENT, onPong);
        extensionDetected = false;
        resolve(false)
      }
    }, 300);
  });
}

/**
 * 通过浏览器插件批量打开标签页
 * @param urls 要打开的 URL 列表
 * @returns 是否成功通过插件打开
 */
export async function openTabsViaExtension(urls: string[]): Promise<boolean> {
  document.dispatchEvent(
    new CustomEvent(OPEN_TABS_EVENT, {
      detail: { urls },
    })
  );
  return true;
}
