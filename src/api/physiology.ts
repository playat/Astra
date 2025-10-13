import { _fetch } from "@/utils/_fetch.js";

export const getPhysiology = async () => {
  return _fetch(`/physiology`, {
    method: "GET",
  });
};

export const addPhysiology = async (data: any) => {
  return _fetch(`/physiology`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const exportPhysiology = async () => {
  return _fetch(`/physiology/export`, {
    method: "POST",
    isFile: true,
  });
};
