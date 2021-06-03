import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { authControllerLogger } from "../logs/auth.controller.logger";

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;
const tokenExpirationTimeInSeconds = 36000;

class AuthController {
  async createJwt(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));

      const hash = crypto
        .createHmac("sha512", salt)
        .update(refreshId)
        .digest("base64");

      req.body.refreshKey = salt.export();

      authControllerLogger("req body:", req.body);

      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationTimeInSeconds,
      });

      return res.status(201).send({ accessToken: token, refreshToken: hash });
    } catch (error) {
      authControllerLogger("createJWT error: %0", error);
      return res.status(500).send();
    }
  }
}

export default new AuthController();
