import debug from "debug";
import { CommonRoutesConfig } from "../routes/common/common.routes.config";

const debugLog: debug.IDebugger = debug("app");

const configDebugLog = (routes: Array<CommonRoutesConfig>) => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });
};

export { configDebugLog };
