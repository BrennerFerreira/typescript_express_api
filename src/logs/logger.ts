import * as winston from "winston";
import * as expressWinston from "express-winston";

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (process.env.NODE_ENV !== "dev") {
  loggerOptions.meta = false;
  if (typeof global.it === "function") {
    loggerOptions.level = "http";
  }
}

const logger = expressWinston.logger(loggerOptions);

export { logger };
