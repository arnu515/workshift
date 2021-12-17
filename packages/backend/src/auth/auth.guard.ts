import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

@Injectable()
export class IsLoggedIn implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const session = context.switchToHttp().getRequest().session;
    if (session.user && session.loggedIn && session.logInAt) {
      return true;
    }

    delete session.user;
    delete session.loggedIn;
    delete session.logInAt;

    throw new UnauthorizedException("You must be logged in to access this resource.");
  }
}
