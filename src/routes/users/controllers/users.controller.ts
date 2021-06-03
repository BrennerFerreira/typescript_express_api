import express from "express";
import usersService from "../services/users.service";
import argon2 from "argon2";
import { usersControllerLogger } from "../logs/users.controller.logger";
import { PatchUserDto } from "../dtos/patch.user.dto";

class UsersController {
  async listUsers(req: express.Request, res: express.Response) {
    const users = await usersService.list(100, 0);
    res.status(200).send(users);
  }

  async getUserById(req: express.Request, res: express.Response) {
    const user = await usersService.readById(req.body.id);
    res.status(200).send(user);
  }

  async createUsers(req: express.Request, res: express.Response) {
    req.body.password = await argon2.hash(req.body.password);
    const userId = await usersService.create(req.body);
    res.status(201).send({ id: userId });
  }

  async patchUser(req: express.Request, res: express.Response) {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password);
    }
    usersControllerLogger(await usersService.patchById(req.body.id, req.body));
    res.status(204).send();
  }

  async putUser(req: express.Request, res: express.Response) {
    req.body.password = await argon2.hash(req.body.password);
    usersControllerLogger(await usersService.putById(req.body.id, req.body));
    res.status(204).send();
  }

  async removeUser(req: express.Request, res: express.Response) {
    usersControllerLogger(await usersService.removeById(req.body.id));
    res.status(204).send();
  }

  async updatePermissionFlags(req: express.Request, res: express.Response) {
    usersControllerLogger("request:", req);
    const patchUserDto: PatchUserDto = {
      permissionsFlag: parseInt(req.params.permissionFlags),
    };
    usersControllerLogger(
      await usersService.patchById(req.body.id, patchUserDto)
    );
    res.status(204).send();
  }
}

export default new UsersController();
