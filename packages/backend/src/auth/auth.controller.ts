import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UseGuards,
  Delete,
  Res,
  Inject,
  Req,
  Headers
} from "@nestjs/common";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { httpError } from "@/util";
import { IsLoggedIn } from "./auth.guard";
import type { Request, Response } from "express";
import axios from "axios";
import * as jwt from "@/util/jwt";
import type { MongoClient } from "mongodb";
import { PrismaService } from "@/prisma/prisma.service";

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
  constructor(
    private auth: AuthService,
    @Inject("Mongo") private mongo: MongoClient,
    private db: PrismaService
  ) {}

  @Post("local/login")
  async login(@Body() body: LocalLoginBody) {
    const user = await this.auth.local(body.email, body.password);
    if (typeof user === "string") {
      return httpError(400, user);
    }

    const accessToken = jwt.createAccessToken(user);
    const refreshToken = await jwt.createRefreshToken(user, this.mongo);
    if (!refreshToken) return httpError(500, "Failed to create refresh token");

    const { providerData: _, ...serUser } = user;
    return { user: serUser, tokens: { access: accessToken, refresh: refreshToken } };
  }

  @Post("local/register")
  async register(@Body() body: LocalRegisterBody) {
    const user = await this.auth.createUser({
      email: body.email,
      username: body.username,
      password: body.password
    });

    if (typeof user === "string") {
      return httpError(400, user);
    }

    const accessToken = jwt.createAccessToken(user);
    const refreshToken = await jwt.createRefreshToken(user, this.mongo);
    if (!refreshToken) return httpError(500, "Failed to create refresh token");

    const { providerData: _, ...serUser } = user;
    return { user: serUser, tokens: { access: accessToken, refresh: refreshToken } };
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

    const accessToken = jwt.createAccessToken(user);
    const refreshToken = await jwt.createRefreshToken(user, this.mongo);

    if (!refreshToken) return httpError(500, "Failed to create refresh token");

    const url = new URL(process.env.APP_URL!);
    url.searchParams.set("status", "200");
    url.searchParams.set("message", `Logged in using ${session.grant.provider}`);
    url.searchParams.set("access", accessToken);
    url.searchParams.set("refresh", refreshToken);
    res.redirect(url.toString());
  }

  @Get("me")
  @UseGuards(IsLoggedIn)
  async me(@Req() req: Request) {
    const { providerData: _, ...toReturn } = (req as any).user;

    return toReturn;
  }

  @Delete("refresh")
  async logout(@Headers("x-refresh-token") refreshToken: string) {
    await jwt.blacklistRefreshToken(refreshToken, this.mongo);
    return { message: "Blacklisted" };
  }

  @Get("refresh")
  async refresh(@Headers("x-refresh-token") refreshToken: string) {
    if (!refreshToken) return httpError(401, "Please provide a refresh token");
    const access = await jwt.refreshToken(refreshToken, this.db, this.mongo);
    if (!access) return httpError(401, "Invalid refresh token");

    return { access };
  }
}
