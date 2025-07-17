export const getAppLsit = async () => {
  const fetchRes = await fetch(`/api/app`, { method: "GET" });
  return await fetchRes.json();
};
