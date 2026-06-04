import CoverMessage from "@/components_ui/CoverMessage.js";
import useAuthStore from "@/store/auth.js";

interface FetchOption extends RequestInit {
  params?: { [key: string]: any };
  isDownload?: boolean;
  isUpload?: boolean;
}

const fontFilter = (url: RequestInfo | URL, init: FetchOption) => {
  init.headers = {
    "x-auth": localStorage.getItem("x-auth") || "",
    "Content-Type": "application/json",
  };
  if (init.isUpload) {
    delete init.headers["Content-Type"];
  }
  let initUrl = `/api${url}`;
  if (init.params) {
    const paramsInstance = new URLSearchParams(init.params);
    initUrl = `${initUrl}?${paramsInstance.toString()}`;
    delete init.params;
  }
  return {
    initOption: init,
    initUrl,
  };
};

const nextFilter = (jsonRes: { [key: string]: any }) => {
  const { code, msg } = jsonRes;
  if (msg) {
    new CoverMessage({ message: msg }).open();
  }
  if (code === 200) {
    return jsonRes;
  }
  if (code === 401) {
    new CoverMessage({ message: "登录过期，请重新登录" }).open();
    useAuthStore().clear();
  }
  if (code === 500) {
    new CoverMessage({ message: '未知错误' }).open();
    return;
  }
  throw new Error(msg);
};

export const _fetch = async (url: RequestInfo | URL, init: FetchOption) => {
  const { initUrl, initOption } = fontFilter(url, init);
  try {
    const fetchRes = await fetch(initUrl, initOption);
    if (initOption.isDownload) {
      return {
        filename: fetchRes.headers
          .get("Content-Disposition")
          ?.replaceAll(/\"/g, "")
          .split("=")[1],
        blob: await fetchRes.blob(),
      };
    }
    const jsonRes = await fetchRes.json();
    return nextFilter(jsonRes);
  } catch (err) {
    console.error(err);
  }
};
