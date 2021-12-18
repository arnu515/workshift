import { Controller, Get, Param, Post, Body, UseGuards, Session } from "@nestjs/common";
import { OrganisationsService } from "./organisations.service";
import {
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsOptional,
  IsMongoId
} from "class-validator";
import { IsLoggedIn } from "../auth/auth.guard";
import { UsersService } from "@/auth/users/users.service";
import { InvitesService } from "./invites/invites.service";
import httpError from "http-errors";

class CreateOrganisationBody {
  @MinLength(4)
  @MaxLength(128)
  @IsNotEmpty()
  name: string;

  @MinLength(4)
  @MaxLength(2048)
  @IsNotEmpty()
  description: string;

  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @MaxLength(2048)
  address?: string;

  @IsOptional()
  @MaxLength(2048)
  location?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

class InviteToOrganisationBody {
  @IsMongoId({ message: "Invalid user ID" })
  @IsNotEmpty()
  userId: string;
}

@Controller("organisations")
export class OrganisationsController {
  constructor(
    private organisationsService: OrganisationsService,
    private usersService: UsersService,
    private invitesService: InvitesService
  ) {}

  @Get(":id")
  async getOrgById(@Param("id") id: string) {
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }
    return org;
  }

  @Post("/")
  @UseGuards(IsLoggedIn)
  async createOrganisation(
    @Body() body: CreateOrganisationBody,
    @Session() session: Record<any, any>
  ) {
    const org = await this.organisationsService.createOrganisation(body, session.user);

    if (typeof org === "string") {
      return httpError(400, org);
    }

    return org;
  }

  @Post("/:id/invite")
  @UseGuards(IsLoggedIn)
  async inviteToOrganisation(
    @Body() body: InviteToOrganisationBody,
    @Session() session: Record<any, any>,
    @Param("id") id: string
  ) {
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner.toString() !== session.user._id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    const invitedUser: any = await this.usersService.users.findById(body.userId);

    if (invitedUser._id.toString() === session.user._id.toString()) {
      return httpError(400, "You can't invite yourself to an organisation");
    }

    if (invitedUser._id.toString() === org.owner.toString()) {
      return httpError(400, "This user is the owner of this organisation");
    }

    const invitedUsersOrgs = await this.organisationsService.getUserOrgs(body.userId);

    if (!invitedUser) {
      return httpError(404, "User not found");
    }

    if (invitedUser._id.toString() === session.user._id.toString()) {
      return httpError(400, "You can't invite yourself");
    }

    if (invitedUsersOrgs.some((org: any) => org.toString() === id)) {
      return httpError(400, "User is already a member of this organisation");
    }

    let invite = await this.invitesService.invites.findOne({
      organisation: org._id,
      toUser: invitedUser._id
    });

    if (invite) {
      return httpError(400, "User has already been invited to this organisation");
    }

    invite = await this.invitesService.invites.create({
      organisation: org._id,
      toUser: invitedUser._id
    });

    return { org, invite };
  }

  @Post("/invites")
  @UseGuards(IsLoggedIn)
  async getUserInvites(@Session() session: Record<any, any>) {
    console.log(session.user)
    return await this.invitesService.getUserInvites(session.user._id);
  }

  @Post("/:id/invites")
  @UseGuards(IsLoggedIn)
  async getOrgInvites(@Param("id") id: string, @Session() session: Record<any, any>) {
    const org = await this.organisationsService.getOrgById(id);
    if (!org) {
      return httpError(404, "Organisation not found");
    }

    if (org.owner.toString() !== session.user._id.toString()) {
      return httpError(403, "You don't own this organisation");
    }

    return await this.invitesService.getOrgInvites(id);
  }
}
