import debug from "debug";

export const mongooseServiceLogger: debug.IDebugger = debug(
  "app:mongoose-service"
);
