import { _fetch } from "@/utils/_fetch.js";

/** 设置默认打开应用（全量覆盖） */
export const setDefaultApps = (appId: string, isDefaultOpen: boolean) => {
  return _fetch(`/app/default-open`, {
    method: "PUT",
    body: JSON.stringify({ appId, isDefaultOpen }),
  });
};
