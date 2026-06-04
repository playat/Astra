import BingIcon from "@/assets/svg/bing.svg";
import GoogleIcon from "@/assets/svg/google.svg";

// 搜索接口配置
const searchApi = {
  edge: {
    url: "https://www.bing.com/search?q=",
    icon: BingIcon,
    label: "Bing",
  },
  google: {
    url: "https://www.google.com/search?q=",
    icon: GoogleIcon,
    label: "Google",
  },
};
export default searchApi;

import PlusIcon from "@/assets/svg/plus.svg";
import BGicon from "@/assets/svg/bg-icon.svg";
import BGSetting from "@/components_system/BGSetting.vue";
import AddEditApp from "@/components_system/AddEditApp.vue";

// 系统图标配置
export const sysIcons = {
  BGicon,
  PlusIcon,
};

// 系统组件配置
export const sysComponents = {
  BGSetting,
  AddEditApp,
};
