import * as http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { CommonRoutesConfig } from "./routes/common/common.routes.config";
import { UsersRoutes } from "./routes/users/users.routes.config";
import { logger } from "./logs/logger";
import { configDebugLog } from "./logs/debugLog";
import { AuthRoutes } from "./routes/auth/auth.routes.config";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT;
const routes: Array<CommonRoutesConfig> = [];

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(logger);
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));

const serverUpMessage = `Server running at: http://localhost:${port}`;

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(serverUpMessage);
});

export default server.listen(port, () => {
  configDebugLog(routes);

  console.log(serverUpMessage);
});
