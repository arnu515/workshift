import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UseGuards,
  Delete
} from "@nestjs/common";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import httpError from "http-errors";
import { IsLoggedIn } from "./auth.guard";
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

    session.user = { ...user };
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

    session.user = { ...user };
    session.loggedIn = true;
    session.logInAt = new Date();

    const { providerData: _, ...toReturn } = user;

    return toReturn;
  }

  @Get("callback")
  async oauthCallback(@Session() session: Record<any, any>) {
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

    const user = await this.auth.createUser({
      email,
      username,
      provider: session.grant.provider,
      providerId: session.grant.response.profile.id.toString(),
      providerData: session.grant.response
    });

    if (typeof user === "string") {
      return httpError(400, user);
    }

    const { providerData: _, ...toReturn } = user;

    return toReturn;
  }

  @Get("me")
  @UseGuards(IsLoggedIn)
  async me(@Session() session: Record<any, any>) {
    const { providerData: _, ...toReturn } = session.user;

    return toReturn;
  }

  @Delete("logout")
  @UseGuards(IsLoggedIn)
  async logout(@Session() session: Record<any, any>) {
    delete session.user;
    delete session.loggedIn;
    delete session.logInAt;

    return { message: "Logged out" };
  }
}
