import { PrismaService } from "@/prisma/prisma.service";
import { hashSync, compareSync, genSaltSync } from "bcryptjs";
import { Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";

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
  constructor(private db: PrismaService) {}

  private checkPw(user: User, password: string) {
    return compareSync(password, user.providerId);
  }

  private hashPw(password: string) {
    return hashSync(password, genSaltSync());
  }

  async local(email: string, password: string) {
    const user = await this.db.user.findFirst({ where: { email } });

    if (!user) return "Invalid email";
    if (user.provider !== "local")
      return `You can't login with a password. Please use "${user.provider}" instead.`;
    if (!this.checkPw(user, password)) return "Invalid password";

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
      providerId = this.hashPw(password);
    }
    let user = await this.db.user.findFirst({ where: { email } });
    if (user) return "Email already exists";

    user = await this.db.user.create({
      data: {
        email,
        username,
        provider: provider!,
        providerId: providerId!,
        providerData
      }
    });

    return user;
  }
}
