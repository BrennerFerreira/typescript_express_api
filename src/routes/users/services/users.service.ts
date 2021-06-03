import { CRUD } from "../../common/interfaces/crud.interface";
import usersDao from "../daos/users.dao";

class UsersService implements CRUD {
  async list(limit: number, page: number) {
    return usersDao.getUsers(limit, page);
  }

  async create(resource: any) {
    return usersDao.createUser(resource);
  }

  async putById(id: string, resource: any) {
    return usersDao.updateUserById(id, resource);
  }

  async readById(id: string) {
    return usersDao.getUserById(id);
  }

  async patchById(id: string, resource: any) {
    return usersDao.updateUserById(id, resource);
  }

  async removeById(id: string) {
    return usersDao.deleteUserById(id);
  }

  async getUserByEmail(email: string) {
    return usersDao.getUserByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return usersDao.getUserByEmailWithPassword(email);
  }
}

export default new UsersService();
