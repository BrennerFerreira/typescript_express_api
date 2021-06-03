import express from "express";
import * as argon2 from "argon2";
import usersService from "../../users/services/users.service";

class AuthMiddleware {
  async verifyUserPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user: any = await usersService.getUserByEmailWithPassword(
      req.body.email
    );

    if (!user) {
      res.status(404).send({ errors: ["Invalid email and/or password"] });
    }

    const passwordHash = user.password;
    const samePassword = await argon2.verify(passwordHash, req.body.password);

    if (!samePassword) {
      res.status(404).send({ errors: ["Invalid email and/or password"] });
    }

    req.body = {
      userId: user._id,
      email: user.email,
      permissionsFlag: user.permissionsFlag,
    };

    return next();
  }
}

export default new AuthMiddleware();
