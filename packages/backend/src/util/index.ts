import { HttpException } from "@nestjs/common";

export function httpError(code: number, message: string, data: Record<any, any> = {}) {
  throw new HttpException({ message, ...data }, code);
}
