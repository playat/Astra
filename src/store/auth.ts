import { defineStore } from "pinia";
import { ref } from "vue";

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

  const loginOut = () => {};

  return {
    token,
    clear,
    loginOut,
    setToken,
  };
});

export default useAuthStore;
