import {
  Controller,
  Post,
  Body,
  Session,
  Request,
  Get,
  UseGuards,
  Delete,
  Res
} from "@nestjs/common";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { httpError } from "@/util";
import { IsLoggedIn } from "./auth.guard";
import type { Response } from "express";
import axios from "axios";

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

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("local/login")
  async login(@Body() body: LocalLoginBody, @Session() session: Record<any, any>) {
    const user = await this.auth.local(body.email, body.password);
    if (typeof user === "string") {
      return httpError(400, user);
    }

    session.userId = user.id;
    session.loggedIn = true;
    session.logInAt = new Date();

    const { providerData: _, ...toReturn } = user;
    return toReturn;
  }

  @Post("local/register")
  async register(
    @Body() body: LocalRegisterBody,
    @Session() session: Record<any, any>
  ) {
    const user = await this.auth.createUser({
      email: body.email,
      username: body.username,
      password: body.password
    });

    if (typeof user === "string") {
      return httpError(400, user);
    }

    session.userId = user.id;
    session.loggedIn = true;
    session.logInAt = new Date();

    const { providerData: _, ...toReturn } = user;

    return toReturn;
  }

  @Post("isregistered")
  async isRegistered(@Body() body: { email: string }) {
    const user = await this.auth.getUser(body.email);
    return { isRegistered: user ? true : false };
  }

  @Get("callback")
  async oauthCallback(@Session() session: Record<any, any>, @Res() res: Response) {
    function httpError(code: number, message: string) {
      const url = new URL(process.env.APP_URL!);
      url.searchParams.set("status", code.toString());
      url.searchParams.set("message", message);
      res.redirect(url.toString());
    }

    let email, username;
    if (session.grant.provider === "github") {
      try {
        const { data: emails } = await axios.get<
          { primary: boolean; verified: boolean; email: string }[]
        >("https://api.github.com/user/emails", {
          headers: {
            Authorization: `token ${session.grant.response.access_token}`
          }
        });
        const primaryVerifiedEmail = emails.find(i => i.primary && i.verified);
        if (!primaryVerifiedEmail) {
          return httpError(
            400,
            "You need to have a primary verified email set to log in using Github."
          );
        }
        email = primaryVerifiedEmail.email;
        username = session.grant.response.profile.login;
      } catch (e) {
        return { message: e.response.data.message };
      }
    } else if (session.grant.provider === "discord") {
      email = session.grant.response.profile.email;
      username =
        session.grant.response.profile.username +
        session.grant.response.profile.discriminator;
    }

    let user = await this.auth.getUser(email);
    if (!user) {
      const createdUser = await this.auth.createUser({
        email,
        username,
        provider: session.grant.provider,
        providerId: session.grant.response.profile.id.toString(),
        providerData: session.grant.response
      });

      if (typeof createdUser === "string") {
        return httpError(400, createdUser);
      }

      user = createdUser;
    }

    if (user.provider !== session.grant.provider) {
      return httpError(
        400,
        `You can't login with a ${session.grant.provider}. Please use ${
          user.provider === "local" ? "your password" : `"${user.provider}"`
        } instead.`
      );
    }

    session.userId = user.id;
    session.loggedIn = true;
    session.logInAt = new Date();

    return httpError(200, `Logged in using "${session.grant.provider}"`);
  }

  @Get("me")
  @UseGuards(IsLoggedIn)
  async me(@Request() request: any) {
    const { providerData: _, ...toReturn } = request.user;

    return toReturn;
  }

  @Delete("logout")
  @UseGuards(IsLoggedIn)
  async logout(@Session() session: Record<any, any>, @Request() request: any) {
    delete session.userId;
    delete session.loggedIn;
    delete session.logInAt;
    delete request.user;

    return { message: "Logged out" };
  }
}
