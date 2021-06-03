import express from "express";
import { PermissionsFlags } from "../enums/common.permissionsFlags.enum";
import { CommonPermissionMiddlewareLogger } from "../logs/common.permission.middleware.logger";

class PermissionsMiddleware {
  permissionFlagsRequired(requiredPermissionFlag: PermissionsFlags) {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userPermissionsFlag = parseInt(res.locals.jwt.permissionsFlag);

        if (userPermissionsFlag & requiredPermissionFlag) {
          next();
        } else {
          res.status(403).send();
        }
      } catch (error) {
        CommonPermissionMiddlewareLogger(error);
      }
    };
  }

  async actionPermittedOnlyForSameUserOrAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const userPermissionsFlag = parseInt(res.locals.jwt.permissionsFlag);

    const sameUser =
      req.params &&
      req.params.userId &&
      req.params.userId === res.locals.jwt.userId;
    const hasAdminPermission =
      userPermissionsFlag & PermissionsFlags.ADMIN_PERMISSION;

    if (sameUser || hasAdminPermission) {
      return next();
    }

    return res.status(403).send();
  }
}

export default new PermissionsMiddleware();
