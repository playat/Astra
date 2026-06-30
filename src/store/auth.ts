import { defineStore } from "pinia";
import { ref } from "vue";
import { logout } from "@/api/auth";
import CoverMessage from "@/components_ui/CoverMessage.js";

const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("x-auth") || "");

  const clear = () => {
    token.value = "";
    localStorage.removeItem("x-auth");
  };

  const setToken = (val: string) => {
    token.value = val;
    localStorage.setItem("x-auth", val);
  };

  const loginOut = async () => {
    try {
      const res = await logout();
      new CoverMessage({ message: res.data ? "已退出登录" : "退出失败" }).open();
    } catch {
      new CoverMessage({ message: "退出失败" }).open();
    } finally {
      clear();
    }
  };

  return {
    token,
    clear,
    loginOut,
    setToken,
  };
});

export default useAuthStore;
