import { _fetch } from "@/utils/_fetch.js";
import { resolve } from "path";

export const getPhysiology = async () => {
  return _fetch(`/physiology`, {
    method: "GET",
  });
};
