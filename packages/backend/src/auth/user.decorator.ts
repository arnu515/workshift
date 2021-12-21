import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { User } from "@prisma/client";

export const GetUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const session = ctx.switchToHttp().getRequest().session;
  return session.user as User;
});
