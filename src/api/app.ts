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
