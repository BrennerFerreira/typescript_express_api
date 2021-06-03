import express from "express";
import { body } from "express-validator";
import { CommonRoutesConfig } from "../common/common.routes.config";
import bodyValidationMiddleware from "../users/middlewares/body.validation.middleware";
import authController from "./controller/auth.controller";
import authMiddleware from "./middlewares/auth.middleware";
import jwtMiddleware from "./middlewares/jwt.middleware";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "AuthRoutes");
  }

  configureRoutes(): express.Application {
    this.app.post("/auth", [
      body("email").isEmail(),
      body("password").isString(),
      bodyValidationMiddleware.verifiyBodyFieldErrors,
      authMiddleware.verifyUserPassword,
      authController.createJwt,
    ]);

    this.app.post("/auth/refresh-token", [
      jwtMiddleware.validJwtNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJwt,
    ]);

    return this.app;
  }
}
