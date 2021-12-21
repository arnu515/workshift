import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class IsLoggedIn implements CanActivate {
  constructor(private db: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session = req.session;
    if (session.userId && session.loggedIn && session.logInAt) {
      const user = await this.db.user.findFirst({
        where: {
          id: session.userId
        }
      });
      if (user) {
        req.user = user;
        return true;
      }
    }

    delete session.userId;
    delete session.loggedIn;
    delete session.logInAt;

    throw new UnauthorizedException("You must be logged in to access this resource.");
  }
}
