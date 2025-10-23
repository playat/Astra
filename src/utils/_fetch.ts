import useAuthStore from "@/store/auth.js";

interface FetchOption extends RequestInit {
  params?: { [key: string]: any };
  isDownload?: boolean;
  isUpload?: boolean;
}

const fontFilter = (url: RequestInfo | URL, init: FetchOption) => {
  init.headers = {
    "X-Auth": localStorage.getItem("X-Auth") || "",
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
  if (code === 200) {
    return jsonRes;
  }
  if (code === 401) {
    useAuthStore().clear();
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
