import shortid from "shortid";
import mongooseService from "../../common/services/mongoose.service";

import { PermissionsFlags } from "../../common/enums/common.permissionsFlags.enum";
import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import { PutUserDto } from "../dtos/put.user.dto";
import { UsersDaoLoggger } from "../logs/users.dao.logger";

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema(
    {
      _id: String,
      email: String,
      password: { type: String, select: false },
      firstName: String,
      lastName: String,
      permissionsFlag: Number,
    },
    { id: false }
  );

  User = mongooseService.getMongoose().model("Users", this.userSchema);

  constructor() {
    UsersDaoLoggger("Created new instance of UsersDao");
  }

  async createUser(userFields: CreateUserDto) {
    const userId = shortid.generate();

    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionsFlag: PermissionsFlags.FREE_PERMISSION,
    });

    await user.save();
    return userId;
  }

  async getUserByEmail(email: string) {
    return this.User.findOne({ email: email }).exec();
  }

  async getUserByEmailWithPassword(email: string) {
    return this.User.findOne({ email: email })
      .select("_id email permissionsFlag +password")
      .exec();
  }

  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).exec();
  }

  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async updateUserById(userId: string, userFields: PutUserDto | PatchUserDto) {
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId },
      { $set: userFields },
      { new: true }
    ).exec();

    return existingUser;
  }

  async deleteUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }
}

export default new UsersDao();
