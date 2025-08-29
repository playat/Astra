interface FetchOption extends RequestInit {
  params?: { [key: string]: any };
}

const fontFilter = (url: RequestInfo | URL, init: FetchOption) => {
  init.headers = {
    "X-Auth": localStorage.getItem("token") || "",
    "Content-Type": "application/json",
  };

  let initUrl = `/api${url}`;
  if (init.params) {
    const paramsInstance = new URLSearchParams(init.params);
    initUrl = `${url}?${paramsInstance.toString()}`;
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
  } else {
    throw new Error(msg);
  }
};

export const _fetch = async (url: RequestInfo | URL, init: FetchOption) => {
  const { initUrl, initOption } = fontFilter(url, init);
  try {
    const fetchRes = await fetch(initUrl, initOption);
    const jsonRes = await fetchRes.json();
    return nextFilter(jsonRes);
  } catch (err) {
    throw err;
  }
};
