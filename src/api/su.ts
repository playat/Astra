import { _fetch } from "@/utils/_fetch.js";

export const suSearch = async (params: { wd: string; type: string }) => {
  return _fetch(`/su`, {
    method: "GET",
    params,
  });
};
