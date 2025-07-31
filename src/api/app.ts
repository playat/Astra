export const getAppLsit = async () => {
  const fetchRes = await fetch(`/api/app`, { method: "GET" });
  return await fetchRes.json();
};

export const addApp = async (data: any) => {
  const fetchRes = await fetch(`/api/app`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await fetchRes.json();
};

export const editApp = async (data: any) => {
  const fetchRes = await fetch(`/api/app`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await fetchRes.json();
};
