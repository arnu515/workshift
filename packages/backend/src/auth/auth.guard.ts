import { PrismaService } from "@/prisma/prisma.service";
import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException
} from "@nestjs/common";
import { getUserFromAccessToken } from "@/util/jwt";

@Injectable()
export class IsLoggedIn implements CanActivate {
  constructor(private db: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException("Invalid token");
    const authHeaderSplit = authHeader.split(" ");
    if (authHeaderSplit.length !== 2 || authHeaderSplit[0].toLowerCase() !== "bearer")
      throw new UnauthorizedException("Invalid token");
    const accessToken = authHeaderSplit[1];
    if (!accessToken.trim()) throw new UnauthorizedException("Invalid token");

    const user = await getUserFromAccessToken(accessToken, this.db);

    if (user) request.user = user;
    return !!user;
  }
}
