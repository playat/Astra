import { defineStore } from "pinia";
import { ref } from "vue";

const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("X-Auth") || "");

  const clear = () => {
    token.value = "";
    localStorage.removeItem("X-Auth");
  };

  const setToken = (val: string) => {
    token.value = val;
    localStorage.setItem("X-Auth", val);
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
