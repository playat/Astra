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
 * 登录系统
 * @param data 登录数据
 * @returns
 */
export const login = (data: any) => {
  return _fetch(`/white/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * 获取公钥
 * @returns
 */
export const getPublicKey = async () => {
  return _fetch(`/white/public_key`, {
    method: "GET",
  });
};
