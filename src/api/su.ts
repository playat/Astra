import { _fetch } from "@/utils/_fetch.js";

export const suSearch = async (params: { wd: string; cb: string }) => {
  return _fetch(`/su`, {
    method: "GET",
    params,
  });
  // const paramsInstance = new URLSearchParams(params);
  // const fetchRes = await fetch(`/api/su?${paramsInstance.toString()}`, {
  //   method: "GET",
  // });
  // return await fetchRes.json();
};
