import { _fetch } from "@/utils/_fetch.js";

/** 获取默认打开应用 ID 列表 */
export const getDefaultApps = () => {
  return _fetch(`/app/default`, { method: "GET" });
};

/** 设置默认打开应用（全量覆盖） */
export const setDefaultApps = (appIds: string[]) => {
  return _fetch(`/app/default`, {
    method: "POST",
    body: JSON.stringify({ appIds }),
  });
};
