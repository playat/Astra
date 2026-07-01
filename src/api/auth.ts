import { _fetch } from "@/utils/_fetch.js";

/**
 * 登录系统
 * @param data 登录数据
 * @returns
 */
export const login = (data: any) => {
  return _fetch(`/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * 获取公钥
 * @returns
 */
export const getPublicKey = async () => {
  return _fetch(`/auth/public_key`, {
    method: "GET",
  });
};

/**
 * 退出登录
 * @returns
 */
export const logout = () => {
  return _fetch(`/auth/logout`, {
    method: "POST",
  });
};
