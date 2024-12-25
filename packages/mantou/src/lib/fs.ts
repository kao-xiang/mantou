export const loadConfig = async (path = "mantou.config.js") => {
  return import(path).then((config) => config.default || config).catch((e) => {
    console.error("Failed to load config", e);
    return {};
  });
}