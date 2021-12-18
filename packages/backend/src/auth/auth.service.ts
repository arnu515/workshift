import { Injectable } from "@nestjs/common";
import { UserModel } from "./users/users.schema";
import { UsersService } from "./users/users.service";

interface CreateUserArgs {
  email: string;
  username: string;
  provider?: string;
  providerId?: string;
  password?: string;
  providerData?: Record<string, any>;
}

@Injectable()
export class AuthService {
  users: UserModel;

  constructor(private usersService: UsersService) {
    this.users = usersService.users;
  }

  async local(email: string, password: string) {
    const user = await this.users.findOne({ email });

    if (!user) return "Invalid email";
    if (user.provider !== "local")
      return `You can't login with a password. Please use "${user.provider}" instead.`;
    if (!this.usersService.checkPw(user, password)) return "Invalid password";

    return user;
  }

  async createUser({
    email,
    username,
    provider,
    providerId,
    password,
    providerData
  }: CreateUserArgs) {
    if (password) {
      provider = "local";
      providerId = this.usersService.hashPw(password);
    }
    let user = await this.users.findOne({ email });
    if (user) return "Email already exists";

    user = new this.users({
      email,
      username,
      provider,
      providerId,
      providerData
    });

    await user.save();

    return user;
  }
}
