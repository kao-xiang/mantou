import path from "path";
import { dynamicImport } from ".";
import { ErrorPage } from "shell/ErrorPage";

export const getErrorPage = async () => {
  const errorPage = await dynamicImport(path.resolve(process.cwd(), global.__mantou_config.appDir, "error.tsx")).catch(() => ErrorPage);

  return errorPage;
};
