import express from "express";
import { body } from "express-validator";
import jwtMiddleware from "../auth/middlewares/jwt.middleware";
import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionsFlags } from "../common/enums/common.permissionsFlags.enum";
import commonPermissionMiddleware from "../common/middlewares/common.permission.middleware";
import usersController from "./controllers/users.controller";
import { usersControllerLogger } from "./logs/users.controller.logger";
import bodyValidationMiddleware from "./middlewares/body.validation.middleware";
import usersMiddleware from "./middlewares/users.middleware";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }

  configureRoutes() {
    this.app
      .route("/users")
      .get(
        jwtMiddleware.validJwtNeeded,
        commonPermissionMiddleware.permissionFlagsRequired(
          PermissionsFlags.ADMIN_PERMISSION
        ),
        usersController.listUsers
      )
      .post(
        body("email").isEmail(),
        body(
          "password",
          "Must include password (at least 6 characters)"
        ).isLength({ min: 5 }),
        bodyValidationMiddleware.verifiyBodyFieldErrors,
        usersMiddleware.validateSameEmailDoesntExist,
        usersController.createUsers
      );

    this.app.param("userId", usersMiddleware.extractUserId);

    this.app
      .route("/users/:userId")
      .all(
        usersMiddleware.validateUserExists,
        jwtMiddleware.validJwtNeeded,
        commonPermissionMiddleware.actionPermittedOnlyForSameUserOrAdmin
      )
      .get(usersController.getUserById)
      .delete(usersController.removeUser);

    this.app.put("/users/:userId", [
      body("email").isEmail(),
      body(
        "password",
        "Must include password (at least 6 characters)"
      ).isLength({ min: 5 }),
      body(["firstName", "lastName"]).isString(),
      body("permissionsFlag").isInt(),
      bodyValidationMiddleware.verifiyBodyFieldErrors,
      usersMiddleware.validateEmailBelongsToUser,
      usersMiddleware.userCantChangePermission,
      commonPermissionMiddleware.permissionFlagsRequired(
        PermissionsFlags.PAID_PERMISSION
      ),
      usersController.putUser,
    ]);

    this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
      jwtMiddleware.validJwtNeeded,
      commonPermissionMiddleware.actionPermittedOnlyForSameUserOrAdmin,

      commonPermissionMiddleware.permissionFlagsRequired(
        PermissionsFlags.FREE_PERMISSION
      ),
      usersController.updatePermissionFlags,
    ]);

    this.app.patch("/users/:userId", [
      body("email").isEmail().optional(),
      body("password", "Must include password (at least 6 characters)")
        .isLength({ min: 5 })
        .optional(),
      body(["firstName", "lastName"]).isString().optional(),
      body("permissionsFlag").isInt().optional(),
      bodyValidationMiddleware.verifiyBodyFieldErrors,
      usersMiddleware.validatePatchEmail,
      usersMiddleware.userCantChangePermission,
      commonPermissionMiddleware.permissionFlagsRequired(
        PermissionsFlags.PAID_PERMISSION
      ),
      usersController.patchUser,
    ]);

    return this.app;
  }
}
