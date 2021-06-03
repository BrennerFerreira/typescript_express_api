import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import usersService from "../../users/services/users.service";
import { Jwt } from "../../common/types/jwt";

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

class JwtMiddleware {
  verifyRefreshBodyField(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(400)
        .send({ errors: ["Missing required fields: refreshToken"] });
    }
  }

  async validRefreshNeeded(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user: any = await usersService.getUserByEmailWithPassword(
      res.locals.jwt.email
    );

    const salt = crypto.createSecretKey(
      Buffer.from(res.locals.jwt.refreshKey.data)
    );

    const hash = crypto
      .createHmac("sha512", salt)
      .update(res.locals.jwt.userId + jwtSecret)
      .digest("base64");

    if (hash === req.body.refreshToken) {
      req.body = {
        userId: user._id,
        email: user.email,
        permissionsFlag: user.permissionsFlag,
      };

      return next();
    } else {
      return res.status(400).send({ errors: ["Invalid refresh token"] });
    }
  }

  validJwtNeeded(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (!req.headers["authorization"]) {
      return res.status(401).send();
    }

    try {
      const authorization = req.headers["authorization"].split(" ");

      if (authorization[0] !== "Bearer") {
        return res.status(401).send();
      }

      res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as Jwt;
      console.log("locals jwt middleware", res.locals);
      next();
    } catch (error) {
      return res.status(403).send();
    }
  }
}

export default new JwtMiddleware();
