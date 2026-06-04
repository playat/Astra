import { _fetch } from "@/utils/_fetch.js";

/**
 * 获取应用列表
 * @returns
 */
export const getAppLsit = () => {
  return _fetch(`/app`, { method: "GET" });
};

/**
 * 添加应用
 * @param data 应用数据
 * @returns
 */
export const addApp = (data: any) => {
  return _fetch(`/app`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * 编辑应用
 * @param data 应用数据
 * @returns
 */
export const editApp = (data: any) => {
  return _fetch(`/app`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * 删除应用
 * @param id 应用ID
 * @returns
 */
export const deleteApp = (id: string) => {
  return _fetch(`/app/${id}`, {
    method: "DELETE",
  });
};

/**
 * 导出应用
 * @returns
 */
export const exportApp = async () => {
  return _fetch(`/app/export`, {
    method: "POST",
    isDownload: true,
  });
};
/**
 * 导入应用列表
 * @param data
 * @returns
 */
export const importApp = async (data: FormData) => {
  return _fetch(`/app/import`, {
    method: "POST",
    body: data,
    isUpload: true,
  });
};
/**
 * 排序应用
 * @param data
 * @returns
 */
export const sortApp = async (data: { fromIndex: number; toIndex: number }) => {
  return _fetch(`/app/sort`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/** 设置/取消默认打开应用 */
export const setDefaultOpen = (appId: string, isDefaultOpen: 0 | 1) => {
  return _fetch(`/app/default-open`, {
    method: "PUT",
    body: JSON.stringify({ appId, isDefaultOpen }),
  });
};
