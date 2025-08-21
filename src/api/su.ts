export const suSearch = async (params: { wd: string; cb: string }) => {
  const paramsInstance = new URLSearchParams(params);
  const fetchRes = await fetch(`/api/su?${paramsInstance.toString()}`, {
    method: "GET",
  });
  return await fetchRes.json();
};
