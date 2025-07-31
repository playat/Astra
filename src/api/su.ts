export const suSearch = async (params: { wd: string; cb: string }) => {
  const url =
    process.env.NODE_ENV === "development"
      ? ""
      : import.meta.env.VITE_SEARCH_SU_API;
  const paramsInstance = new URLSearchParams(params);
  const res = await fetch(`${url}/su?${paramsInstance.toString()}`, {
    method: "GET",
  });
  const bufferRes = await res.arrayBuffer();
  const decoder = new TextDecoder("gbk");
  const text = decoder.decode(bufferRes);
  return new Function(`const SUJsonP = (data) => data; return ${text}`)();
};
