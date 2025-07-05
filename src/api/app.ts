export const getAppLsit = async () => {
  const res = await import("../../public/app_conf.json");
  return res.default;
};
