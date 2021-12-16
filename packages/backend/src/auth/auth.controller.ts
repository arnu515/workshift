import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import httpError from 'http-errors';
import { IsLoggedIn } from './auth.guard';

class LocalLoginBody {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

class LocalRegisterBody extends LocalLoginBody {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(64)
  username: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('local/login')
  async login(
    @Body() body: LocalLoginBody,
    @Session() session: Record<any, any>,
  ) {
    const user = await this.auth.local(body.email, body.password);
    if (typeof user === 'string') {
      return httpError(400, user);
    }

    session.user = user.toObject();
    session.loggedIn = true;
    session.logInAt = new Date();

    const { providerData: _, ...toReturn } = user.toObject();
    return toReturn;
  }

  @Post('local/register')
  async register(
    @Body() body: LocalRegisterBody,
    @Session() session: Record<any, any>,
  ) {
    const user = await this.auth.createUser({
      email: body.email,
      username: body.username,
      password: body.password,
    });

    if (typeof user === 'string') {
      return httpError(400, user);
    }

    session.user = user.toObject();
    session.loggedIn = true;
    session.logInAt = new Date();

    const { providerData: _, ...toReturn } = user.toObject();

    return toReturn;
  }

  @Get('me')
  @UseGuards(IsLoggedIn)
  async me(@Session() session: Record<any, any>) {
    const { providerData: _, ...toReturn } = session.user;

    return toReturn;
  }
}
